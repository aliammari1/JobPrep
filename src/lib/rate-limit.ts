/**
 * Rate limiting for expensive endpoints (AI inference, LiveKit token mint).
 *
 * Backed by Upstash Redis (`@upstash/ratelimit`) when
 * `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` are configured;
 * otherwise it degrades to a permissive no-op so local/self-host setups run
 * with zero extra infrastructure. This is the "BYOK / self-host first" stance:
 * the protection is opt-in via env, not a hard dependency.
 *
 * Usage in a route handler:
 *
 *   const { success, ...info } = await rateLimit(req, "ai");
 *   if (!success) return rateLimitResponse(info);
 */
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

type Bucket = "ai" | "livekit" | "default";

interface LimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const enabled = Boolean(redisUrl && redisToken);

const redis = enabled
  ? new Redis({ url: redisUrl as string, token: redisToken as string })
  : null;

/** Per-bucket windows. AI/LiveKit are paid fan-outs, so they're stricter. */
const LIMITERS: Record<Bucket, Ratelimit | null> = redis
  ? {
      ai: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, "1 m"),
        prefix: "rl:ai",
        analytics: true,
      }),
      livekit: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "1 m"),
        prefix: "rl:livekit",
        analytics: true,
      }),
      default: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, "1 m"),
        prefix: "rl:default",
        analytics: true,
      }),
    }
  : { ai: null, livekit: null, default: null };

/** Best-effort client identifier from forwarding headers. */
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
 * Check the rate limit for a request. When Upstash is not configured this
 * always succeeds (no-op), so the endpoint behaves exactly as before.
 */
export async function rateLimit(
  req: Request,
  bucket: Bucket = "default",
  identifier?: string,
): Promise<LimitResult> {
  const limiter = LIMITERS[bucket];
  if (!limiter) {
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }
  const id = identifier ?? clientId(req);
  const res = await limiter.limit(`${bucket}:${id}`);
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
