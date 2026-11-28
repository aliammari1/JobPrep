import { getCloudflareContext } from "@opennextjs/cloudflare";

interface CloudflareRateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

/**
 * Minimal Cloudflare Workers binding types for `cloudflare-env.d.ts`
 * (generated with `wrangler types --env-interface CloudflareEnv --include-runtime=false`).
 * Keeps Workers binding types strict without overriding DOM `Request`/`Response` globals.
 */
declare global {
  interface R2Object {
    key: string;
    size: number;
    etag: string;
    httpEtag: string;
    httpMetadata?: { contentType?: string };
  }

  interface R2ObjectBody extends R2Object {
    body: ReadableStream<Uint8Array>;
    arrayBuffer(): Promise<ArrayBuffer>;
  }

  interface R2Bucket {
    head(key: string): Promise<R2Object | null>;
    get(
      key: string,
      options?: { range?: { offset?: number; length?: number } },
    ): Promise<R2ObjectBody | null>;
    put(
      key: string,
      value: ArrayBuffer | Uint8Array | ReadableStream | string | null,
      options?: {
        httpMetadata?: { contentType?: string };
        onlyIf?: { etagDoesNotMatch?: string };
        customMetadata?: Record<string, string>;
      },
    ): Promise<R2Object | null>;
    delete(keys: string | string[]): Promise<void>;
  }

  interface Fetcher {
    fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
  }

  type Service<T = unknown> = Fetcher & { readonly __service?: T };

  interface ImagesBinding {
    input(stream: ReadableStream<Uint8Array>): unknown;
  }

  interface Hyperdrive {
    readonly connectionString: string;
    readonly host: string;
    readonly port: number;
    readonly user: string;
    readonly password: string;
    readonly database: string;
  }

  interface CloudflareEnv {
    AI_RATE_LIMITER?: CloudflareRateLimiter;
    LIVEKIT_RATE_LIMITER?: CloudflareRateLimiter;
    DEFAULT_RATE_LIMITER?: CloudflareRateLimiter;
    CF_AI_GATEWAY_URL?: string;
  }
}

/** Local Node.js can start without a Worker context. */
export function cloudflareContext() {
  try {
    return getCloudflareContext();
  } catch (error) {
    if (process.env.NEXT_RUNTIME === "edge") throw error;
    return null;
  }
}

/**
 * Schedule non-blocking background work (telemetry, cleanup, webhooks) via
 * Cloudflare Workers `ctx.waitUntil()` when running on the edge, or fire-and-forget
 * safely in local Node.js.
 */
export function runInBackground(task: Promise<unknown>): void {
  const cf = cloudflareContext();
  if (cf?.ctx?.waitUntil) {
    cf.ctx.waitUntil(task.catch(() => {}));
  } else {
    void task.catch(() => {});
  }
}
