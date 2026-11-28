import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Pool } from "pg";

const {
  DATABASE_URL,
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_API_KEY,
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_RECORDINGS_BUCKET = "jobprep-recordings",
} = process.env;

if (
  !DATABASE_URL ||
  !APPWRITE_ENDPOINT ||
  !APPWRITE_PROJECT_ID ||
  !APPWRITE_API_KEY ||
  !R2_ACCOUNT_ID ||
  !R2_ACCESS_KEY_ID ||
  !R2_SECRET_ACCESS_KEY
) {
  throw new Error(
    "Set DATABASE_URL, APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY before migrating.",
  );
}

const endpoint = new URL(APPWRITE_ENDPOINT);
if (
  endpoint.protocol !== "https:" ||
  endpoint.username ||
  endpoint.password ||
  endpoint.search ||
  endpoint.hash
) {
  throw new Error("APPWRITE_ENDPOINT must be an HTTPS API base URL");
}
const apiBase = endpoint.href.replace(/\/$/, "");
const appwriteHeaders = {
  "X-Appwrite-Project": APPWRITE_PROJECT_ID,
  "X-Appwrite-Key": APPWRITE_API_KEY,
};
const db = new Pool({ connectionString: DATABASE_URL, max: 1 });
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

type AppwriteItem = { $id: string; [field: string]: unknown };
type AppwriteFile = AppwriteItem & {
  name: string;
  mimeType: string;
  sizeOriginal: number;
};
const archive = `legacy/appwrite/${encodeURIComponent(APPWRITE_PROJECT_ID)}`;
const temp = await mkdtemp(join(tmpdir(), "jobprep-appwrite-"));

async function appwrite(path: string): Promise<Response> {
  const response = await fetch(`${apiBase}${path}`, {
    headers: appwriteHeaders,
    redirect: "error",
  });
  if (!response.ok)
    throw new Error(
      `Appwrite ${path.split("?")[0]} returned HTTP ${response.status}`,
    );
  return response;
}

async function* list<T extends AppwriteItem>(
  path: string,
  field: string,
): AsyncGenerator<T> {
  let cursor: string | undefined;
  for (;;) {
    const queries = new URLSearchParams();
    queries.append(
      "queries[]",
      JSON.stringify({ method: "limit", values: [100] }),
    );
    if (cursor)
      queries.append(
        "queries[]",
        JSON.stringify({ method: "cursorAfter", values: [cursor] }),
      );
    const payload = (await (
      await appwrite(`${path}?${queries}`)
    ).json()) as Record<string, unknown>;
    const items = payload[field] as T[] | undefined;
    if (!Array.isArray(items))
      throw new Error(`Appwrite response missing ${field}`);
    if (!items.length) return;
    yield* items;
    const next = items.at(-1)?.$id;
    if (!next || next === cursor)
      throw new Error(`Appwrite pagination stalled for ${path}`);
    cursor = next;
  }
}

async function archiveJson(key: string, data: unknown) {
  await r2.send(
    new PutObjectCommand({
      Bucket: R2_RECORDINGS_BUCKET,
      Key: key,
      Body: JSON.stringify(data),
      ContentType: "application/json",
    }),
  );
}

async function transferFile(path: string, file: AppwriteFile, key: string) {
  if (!Number.isSafeInteger(file.sizeOriginal) || file.sizeOriginal < 0) {
    throw new Error(`Invalid source length for file ${file.$id}`);
  }
  const destination = join(temp, "transfer");
  try {
    const response = await appwrite(`${path}/download`);
    if (!response.body) throw new Error(`Missing source body for ${file.$id}`);
    await pipeline(
      Readable.fromWeb(response.body as NodeReadableStream<Uint8Array>),
      createWriteStream(destination),
    );
    const size = (await stat(destination)).size;
    if (size !== file.sizeOriginal)
      throw new Error(`Incomplete download for ${file.$id}`);

    const source = createHash("sha256");
    for await (const chunk of createReadStream(destination))
      source.update(chunk);
    const sha256 = source.digest("hex");
    const object = await r2
      .send(new HeadObjectCommand({ Bucket: R2_RECORDINGS_BUCKET, Key: key }))
      .catch((error: unknown) => {
        if (
          (error as { $metadata?: { httpStatusCode?: number } }).$metadata
            ?.httpStatusCode === 404
        )
          return null;
        throw error;
      });
    if (object?.ContentLength !== size || object.Metadata?.sha256 !== sha256) {
      await r2.send(
        new PutObjectCommand({
          Bucket: R2_RECORDINGS_BUCKET,
          Key: key,
          Body: createReadStream(destination),
          ContentLength: size,
          ContentType: file.mimeType || "application/octet-stream",
          Metadata: { sha256 },
        }),
      );
    }
    const stored = await r2.send(
      new GetObjectCommand({ Bucket: R2_RECORDINGS_BUCKET, Key: key }),
    );
    if (!stored.Body || stored.ContentLength !== size)
      throw new Error(`Unexpected R2 length for ${key}`);
    const storedHash = createHash("sha256");
    const reader = stored.Body.transformToWebStream().getReader();
    try {
      for (;;) {
        const chunk = await reader.read();
        if (chunk.done) break;
        storedHash.update(chunk.value);
      }
    } finally {
      reader.releaseLock();
    }
    if (storedHash.digest("hex") !== sha256)
      throw new Error(`Checksum mismatch for ${key}`);
  } finally {
    await rm(destination, { force: true });
  }
}

try {
  const legacy = await db.query<{ id: string; videoRecordingUrl: string }>(
    'SELECT "id", "videoRecordingUrl" FROM "interview" WHERE "videoRecordingUrl" IS NOT NULL AND "recordingObjectKey" IS NULL ORDER BY "id"',
  );
  for (const row of legacy.rows) {
    let source: URL;
    try {
      source = new URL(row.videoRecordingUrl);
    } catch {
      throw new Error(`Interview ${row.id} has an unrecognized recording URL`);
    }
    const rootPath = endpoint.pathname.replace(/\/$/, "");
    const filePath = source.pathname.slice(rootPath.length);
    const match =
      /^\/storage\/buckets\/([^/]+)\/files\/([^/]+)\/(?:view|download)$/.exec(
        filePath,
      );
    if (
      source.origin !== endpoint.origin ||
      !source.pathname.startsWith(`${rootPath}/`) ||
      !match ||
      (source.searchParams.has("project") &&
        source.searchParams.get("project") !== APPWRITE_PROJECT_ID)
    ) {
      throw new Error(
        `Interview ${row.id} has a recording outside the configured Appwrite source. Import it separately before cutover.`,
      );
    }
    const bucketId = decodeURIComponent(match[1]);
    const fileId = decodeURIComponent(match[2]);
    const path = `/storage/buckets/${encodeURIComponent(bucketId)}/files/${encodeURIComponent(fileId)}`;
    const file = (await (await appwrite(path)).json()) as AppwriteFile;
    if (file.$id !== fileId)
      throw new Error(`Unexpected source file for interview ${row.id}`);
    const key = `recordings/imported/${encodeURIComponent(bucketId)}/${encodeURIComponent(fileId)}/${encodeURIComponent(row.id)}`;
    await transferFile(path, file, key);
    await archiveJson(
      `${archive}/recording-references/${encodeURIComponent(row.id)}.json`,
      { interviewId: row.id, sourceUrl: row.videoRecordingUrl, r2Key: key },
    );

    const mime =
      file.mimeType === "video/webm" || file.mimeType === "video/mp4"
        ? file.mimeType
        : "application/octet-stream";
    const update = await db.query(
      `UPDATE "interview"
       SET "videoRecordingUrl" = $1, "recordingObjectKey" = $2,
           "recordingFileName" = $3, "recordingContentType" = $4, "recordingSize" = $5
       WHERE "id" = $6 AND "videoRecordingUrl" = $7 AND "recordingObjectKey" IS NULL`,
      [
        `/api/recordings/${encodeURIComponent(row.id)}`,
        key,
        file.name,
        mime,
        file.sizeOriginal,
        row.id,
        row.videoRecordingUrl,
      ],
    );
    if (!update.rowCount)
      throw new Error(
        `Recording for interview ${row.id} changed during migration`,
      );
    console.log(`Imported recording for interview ${row.id}`);
  }

  const linked = await db.query<{ recordingObjectKey: string }>(
    `SELECT "recordingObjectKey" FROM "interview" WHERE "recordingObjectKey" LIKE 'recordings/imported/%'`,
  );
  const recordingSources = new Map<string, string[]>();
  for (const row of linked.rows) {
    const source = row.recordingObjectKey.split("/").slice(2, 4).join("/");
    const copies = recordingSources.get(source) ?? [];
    copies.push(row.recordingObjectKey);
    recordingSources.set(source, copies);
  }

  // Historical tables have no application readers. Keep their source IDs,
  // schemas and rows in the private archive without merging them into live data.
  for await (const database of list("/tablesdb", "databases")) {
    const databasePath = `/tablesdb/${encodeURIComponent(database.$id)}`;
    await archiveJson(`${archive}${databasePath}/metadata.json`, database);
    for await (const table of list(`${databasePath}/tables`, "tables")) {
      const tablePath = `${databasePath}/tables/${encodeURIComponent(table.$id)}`;
      await archiveJson(`${archive}${tablePath}/metadata.json`, table);
      for await (const row of list(`${tablePath}/rows`, "rows")) {
        await archiveJson(
          `${archive}${tablePath}/rows/${encodeURIComponent(row.$id)}.json`,
          row,
        );
      }
    }
  }

  for await (const bucket of list("/storage/buckets", "buckets")) {
    const bucketPath = `/storage/buckets/${encodeURIComponent(bucket.$id)}`;
    await archiveJson(`${archive}${bucketPath}/metadata.json`, bucket);
    for await (const file of list<AppwriteFile>(
      `${bucketPath}/files`,
      "files",
    )) {
      const filePath = `${bucketPath}/files/${encodeURIComponent(file.$id)}`;
      const source = `${encodeURIComponent(bucket.$id)}/${encodeURIComponent(file.$id)}`;
      const liveCopies = recordingSources.get(source);
      const keys = liveCopies ?? [`${archive}${filePath}/content`];
      if (!liveCopies) await transferFile(filePath, file, keys[0]);
      await archiveJson(`${archive}${filePath}/metadata.json`, {
        ...file,
        r2Keys: keys,
      });
    }
  }
  console.log(
    "Imported linked recordings and archived historical Appwrite tables and files.",
  );
} finally {
  await db.end();
  r2.destroy();
  await rm(temp, { recursive: true, force: true });
}
