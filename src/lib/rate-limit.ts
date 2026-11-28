/**
 * Rate limiting for expensive endpoints (AI inference, LiveKit token mint).
 *
 * Resolution order (Cloudflare-first):
 *  1. Native Cloudflare Workers Rate Limiting binding (`AI_RATE_LIMITER`,
 *     `LIVEKIT_RATE_LIMITER`, `DEFAULT_RATE_LIMITER` in `wrangler.jsonc`) —
 *     zero external network round-trips.
 *  2. Upstash Redis (`@upstash/ratelimit`) when `UPSTASH_REDIS_REST_URL` +
 *     `UPSTASH_REDIS_REST_TOKEN` are configured.
 *  3. Permissive no-op for local/self-host development.
 */
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { cloudflareContext } from "./cloudflare";

type Bucket = "ai" | "livekit" | "default";

interface LimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

const BUCKET_LIMITS: Record<Bucket, number> = {
  ai: 20,
  livekit: 10,
  default: 60,
};

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const enabled = Boolean(redisUrl && redisToken);

const redis = enabled
  ? new Redis({ url: redisUrl as string, token: redisToken as string })
  : null;

const LIMITERS: Record<Bucket, Ratelimit | null> = redis
  ? {
      ai: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(BUCKET_LIMITS.ai, "1 m"),
        prefix: "rl:ai",
        analytics: true,
      }),
      livekit: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(BUCKET_LIMITS.livekit, "1 m"),
        prefix: "rl:livekit",
        analytics: true,
      }),
      default: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(BUCKET_LIMITS.default, "1 m"),
        prefix: "rl:default",
        analytics: true,
      }),
    }
  : { ai: null, livekit: null, default: null };

/** Best-effort client identifier from Cloudflare / forwarding headers. */
function clientId(req: Request): string {
  const h = req.headers;
  return (
    h.get("cf-connecting-ip") ||
    h.get("x-real-ip") ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anonymous"
  );
}

/**
 * Check the rate limit for a request. Prefers native Cloudflare Workers
 * Rate Limiting bindings, then Upstash Redis, then permissive no-op locally.
 */
export async function rateLimit(
  req: Request,
  bucket: Bucket = "default",
  identifier?: string,
): Promise<LimitResult> {
  const id = identifier ?? clientId(req);
  const key = `${bucket}:${id}`;

  // 1. Native Cloudflare Workers Rate Limiter binding
  const cfEnv = cloudflareContext()?.env;
  const cfLimiter =
    bucket === "ai"
      ? cfEnv?.AI_RATE_LIMITER
      : bucket === "livekit"
        ? cfEnv?.LIVEKIT_RATE_LIMITER
        : cfEnv?.DEFAULT_RATE_LIMITER;

  if (cfLimiter) {
    const { success } = await cfLimiter.limit({ key });
    const max = BUCKET_LIMITS[bucket];
    return {
      success,
      limit: max,
      remaining: success ? Math.max(0, max - 1) : 0,
      reset: Date.now() + 60_000,
    };
  }

  // 2. Upstash Redis fallback
  const limiter = LIMITERS[bucket];
  if (!limiter) {
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }
  const res = await limiter.limit(key);
  return {
    success: res.success,
    limit: res.limit,
    remaining: res.remaining,
    reset: res.reset,
  };
}

/** Standard 429 response with rate-limit headers. */
export function rateLimitResponse(info: Omit<LimitResult, "success">) {
  return NextResponse.json(
    { error: "Too many requests. Please slow down and try again shortly." },
    {
      status: 429,
      headers: {
        "RateLimit-Limit": String(info.limit),
        "RateLimit-Remaining": String(info.remaining),
        "RateLimit-Reset": String(info.reset),
        "Retry-After": String(
          Math.max(1, Math.ceil((info.reset - Date.now()) / 1000)),
        ),
      },
    },
  );
}

export const rateLimitEnabled = enabled;
