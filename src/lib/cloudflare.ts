/**
 * Cloudflare Workers runtime helpers (Hyperdrive + R2).
 *
 * All helpers degrade gracefully to `null` when running on standard Node.js /
 * Docker / local dev outside a Cloudflare Worker runtime.
 */

export interface CloudflareHyperdriveBinding {
  connectionString: string;
}

export interface CloudflareR2Object {
  key: string;
  size: number;
  etag: string;
  httpMetadata?: { contentType?: string };
  arrayBuffer(): Promise<ArrayBuffer>;
}

export interface CloudflareR2BucketBinding {
  put(
    key: string,
    value: ArrayBuffer | Uint8Array | ReadableStream | string,
    options?: {
      httpMetadata?: { contentType?: string };
      customMetadata?: Record<string, string>;
    },
  ): Promise<CloudflareR2Object | null>;
  get(key: string): Promise<CloudflareR2Object | null>;
  delete(key: string | string[]): Promise<void>;
}

export interface JobPrepCloudflareEnv {
  HYPERDRIVE?: CloudflareHyperdriveBinding;
  RECORDINGS_BUCKET?: CloudflareR2BucketBinding;
  R2_PUBLIC_URL?: string;
}

/**
 * Safely retrieve Cloudflare Worker bindings via `@opennextjs/cloudflare` when
 * executing inside a Worker (or `CLOUDFLARE_DEV=1`). Returns `null` on Node.js.
 */
export async function getCloudflareEnv(): Promise<JobPrepCloudflareEnv | null> {
  try {
    const mod = await import("@opennextjs/cloudflare");
    if (typeof mod.getCloudflareContext !== "function") return null;
    const ctx = await mod.getCloudflareContext({ async: true });
    return (ctx?.env as JobPrepCloudflareEnv | undefined) ?? null;
  } catch {
    return null;
  }
}

/**
 * Returns the Cloudflare Hyperdrive pooled PostgreSQL connection string if
 * bound, otherwise `null` (falling back to `DATABASE_URL`).
 */
export async function getHyperdriveConnectionString(): Promise<string | null> {
  const env = await getCloudflareEnv();
  return env?.HYPERDRIVE?.connectionString ?? null;
}

/**
 * Uploads a recording or exported artifact to Cloudflare R2 if the
 * `RECORDINGS_BUCKET` binding is configured.
 */
export async function uploadToR2(
  key: string,
  data: ArrayBuffer | Uint8Array,
  contentType: string,
): Promise<{ key: string; url: string | null } | null> {
  const env = await getCloudflareEnv();
  if (!env?.RECORDINGS_BUCKET) return null;

  await env.RECORDINGS_BUCKET.put(key, data, {
    httpMetadata: { contentType },
  });

  const baseUrl = env.R2_PUBLIC_URL?.replace(/\/+$/, "");
  return {
    key,
    url: baseUrl ? `${baseUrl}/${key}` : null,
  };
}

/**
 * Deletes an object from Cloudflare R2 when the binding is configured.
 */
export async function deleteFromR2(key: string): Promise<boolean> {
  const env = await getCloudflareEnv();
  if (!env?.RECORDINGS_BUCKET) return false;
  await env.RECORDINGS_BUCKET.delete(key);
  return true;
}
