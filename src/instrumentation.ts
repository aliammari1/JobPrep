/**
 * Next.js instrumentation entrypoint (runs once at server boot).
 *
 * - Validates typed environment via `@/env` (unless SKIP_ENV_VALIDATION=1).
 * - Registers an OpenTelemetry SDK (`@vercel/otel`) so AI-SDK
 *   `experimental_telemetry` spans (token usage / latency / cost) are exported.
 * - Loads the Sentry runtime config (no-op unless SENTRY_DSN is set).
 *
 * All optional pieces are gated on env so a default self-host run stays quiet.
 */
import { registerOTel } from "@vercel/otel";

export async function register() {
  // Boot-time env validation (typed). Importing triggers the Zod parse.
  await import("@/env");

  registerOTel({ serviceName: "jobprep" });

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
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
