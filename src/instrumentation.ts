/**
 * Next.js instrumentation entrypoint (runs once at server boot).
 *
 * - Validates typed environment via `@/env` (unless SKIP_ENV_VALIDATION=1).
 * - Registers an OpenTelemetry SDK (`@vercel/otel`) so AI-SDK telemetry spans
 *   (token usage / latency / cost) are exported in the Node.js runtime.
 * - Registers the AI SDK 7 `@ai-sdk/otel` integration globally.
 * - Loads the Sentry runtime config (no-op unless SENTRY_DSN is set).
 *
 * Telemetry is OPTIONAL. It is loaded with dynamic imports inside a guarded
 * block: static top-level imports of the OTel packages are evaluated when the
 * instrumentation hook is loaded, which crashes edge/Worker runtimes before
 * any route can respond. A telemetry failure must never take the app down.
 */

export async function register() {
  // Boot-time env validation (typed). Importing triggers the Zod parse.
  await import("@/env");

  // @vercel/otel relies on Node.js primitives unavailable in Workers/edge.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const [{ registerOTel }, { OpenTelemetry }, { registerTelemetry }] =
        await Promise.all([
          import("@vercel/otel"),
          import("@ai-sdk/otel"),
          import("ai"),
        ]);
      registerOTel({ serviceName: "jobprep" });
      registerTelemetry(new OpenTelemetry());
    } catch (error) {
      console.warn(
        "JobPrep: OpenTelemetry unavailable, continuing without it.",
        error,
      );
    }
  }

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
