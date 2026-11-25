/**
 * Next.js instrumentation entrypoint (runs once at server boot).
 *
 * - Validates typed environment via `@/env` (unless SKIP_ENV_VALIDATION=1).
 * - Registers an OpenTelemetry SDK (`@vercel/otel`) so AI-SDK
 *   `telemetry` spans (token usage / latency / cost) are exported.
 * - Registers the AI SDK 7 `@ai-sdk/otel` integration globally, so every
 *   `telemetry: { functionId }` call in `src/lib/ai` emits spans without
 *   per-call opt-in.
 * - Loads the Sentry runtime config (no-op unless SENTRY_DSN is set).
 *
 * All optional pieces are gated on env so a default self-host run stays quiet.
 */

import { OpenTelemetry } from "@ai-sdk/otel";
import { registerOTel } from "@vercel/otel";
import { registerTelemetry } from "ai";

export async function register() {
  // Boot-time env validation (typed). Importing triggers the Zod parse.
  await import("@/env");

  registerOTel({ serviceName: "jobprep" });
  registerTelemetry(new OpenTelemetry());

  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.SENTRY_DSN) {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge" && process.env.SENTRY_DSN) {
    await import("../sentry.edge.config");
  }
}

export async function onRequestError(
  ...args: Parameters<typeof import("@sentry/nextjs").captureRequestError>
) {
  if (process.env.SENTRY_DSN) {
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureRequestError(...args);
  }
}
