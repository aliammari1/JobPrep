import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cloudflareContext } from "@/lib/cloudflare";
import prisma from "@/lib/prisma";

declare const FixedLengthStream: {
  new (length: number): TransformStream<Uint8Array, Uint8Array>;
};

const MAX_RECORDING_SIZE = 90 * 1024 * 1024;
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const interviewId = searchParams.get("interviewId");
    const uploadId = searchParams.get("uploadId");
    const size = Number(searchParams.get("size"));
    const contentType =
      request.headers.get("content-type")?.split(";")[0] ?? "";
    if (!interviewId || !uploadId || !uuid.test(uploadId) || !request.body) {
      return NextResponse.json(
        { error: "Invalid recording upload" },
        { status: 400 },
      );
    }
    if (contentType !== "video/webm" && contentType !== "video/mp4") {
      return NextResponse.json(
        { error: "Upload a WebM or MP4 recording" },
        { status: 415 },
      );
    }
    if (!Number.isSafeInteger(size) || size <= 0) {
      return NextResponse.json(
        { error: "Invalid recording size" },
        { status: 400 },
      );
    }
    if (size > MAX_RECORDING_SIZE) {
      return NextResponse.json(
        { error: "Recordings must be 90 MiB or smaller" },
        { status: 413 },
      );
    }
    const contentLength = request.headers.get("content-length");
    if (contentLength !== null && Number(contentLength) !== size) {
      return NextResponse.json(
        { error: "Recording length does not match" },
        { status: 400 },
      );
    }

    const participants = [
      { candidateId: session.user.id },
      { interviewerId: session.user.id },
    ];
    const interview = await prisma.interview.findFirst({
      where: { id: interviewId, OR: participants },
      select: {
        allowRecording: true,
        recordingObjectKey: true,
        videoRecordingUrl: true,
      },
    });
    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 },
      );
    }
    if (!interview.allowRecording) {
      return NextResponse.json(
        { error: "Recording is disabled for this interview" },
        { status: 403 },
      );
    }
    if (interview.videoRecordingUrl && !interview.recordingObjectKey) {
      return NextResponse.json(
        {
          error:
            "The previous recording must be migrated before it can be replaced",
        },
        { status: 409 },
      );
    }

    const bucket = cloudflareContext()?.env.RECORDINGS_BUCKET;
    if (!bucket) {
      return NextResponse.json(
        { error: "Recording storage is unavailable" },
        { status: 503 },
      );
    }

    const extension = contentType === "video/mp4" ? "mp4" : "webm";
    const key = `recordings/${interviewId}/${uploadId}`;
    const fileName = `interview-${interviewId}.${extension}`;
    const fileUrl = `/api/recordings/${encodeURIComponent(interviewId)}`;
    const success = () =>
      NextResponse.json({
        success: true,
        recording: {
          fileId: interviewId,
          fileName,
          fileSize: size,
          fileUrl,
          mimeType: contentType,
        },
      });

    if (interview.recordingObjectKey !== key) {
      const deleteAfter = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await prisma.recordingObjectCleanup.upsert({
        where: { objectKey: key },
        create: { objectKey: key, deleteAfter },
        update: { deleteAfter, attempts: 0 },
      });
    }
    let object = await bucket.head(key);
    if (!object) {
      const options = {
        httpMetadata: { contentType },
        onlyIf: { etagDoesNotMatch: "*" },
      };
      if (typeof FixedLengthStream === "undefined") {
        // Next.js development runs in Node with the local R2 binding proxy.
        const bytes = await request.arrayBuffer();
        if (bytes.byteLength !== size) {
          return NextResponse.json(
            { error: "Recording length does not match" },
            { status: 400 },
          );
        }
        object = await bucket.put(key, bytes, options);
      } else {
        const stream = new FixedLengthStream(size);
        const abort = new AbortController();
        const write = bucket.put(key, stream.readable, options).then(
          (result: R2Object | null) => {
            if (!result) abort.abort();
            return result;
          },
          (error: unknown) => {
            abort.abort();
            throw error;
          },
        );
        const pipe = request.body.pipeTo(stream.writable, {
          signal: abort.signal,
        });
        const [written, piped] = await Promise.allSettled([write, pipe]);
        if (written.status === "rejected") throw written.reason;
        if (written.value && piped.status === "rejected") throw piped.reason;
        object = written.value;
      }
      object ??= await bucket.head(key);
    } else {
      await request.body.cancel();
    }
    if (
      object?.size !== size ||
      object.httpMetadata?.contentType !== contentType
    ) {
      return NextResponse.json(
        { error: "Upload conflicts with an earlier request" },
        { status: 409 },
      );
    }
    if (interview.recordingObjectKey === key) return success();

    const attached = await prisma.interview.updateMany({
      where: {
        id: interviewId,
        OR: participants,
        allowRecording: true,
        recordingObjectKey: interview.recordingObjectKey,
        videoRecordingUrl: interview.videoRecordingUrl,
      },
      data: {
        videoRecordingUrl: fileUrl,
        recordingObjectKey: key,
        recordingFileName: fileName,
        recordingContentType: contentType,
        recordingSize: size,
      },
    });
    if (!attached.count) {
      const current = await prisma.interview.findUnique({
        where: { id: interviewId },
        select: { recordingObjectKey: true },
      });
      if (current?.recordingObjectKey === key) {
        return success();
      }
      return NextResponse.json(
        { error: "The recording changed during upload" },
        { status: 409 },
      );
    }

    return success();
  } catch (error) {
    console.error("Recording upload failed", error);
    return NextResponse.json(
      { error: "Failed to upload recording" },
      { status: 500 },
    );
  }
}
