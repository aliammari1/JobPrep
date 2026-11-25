import * as Sentry from "@sentry/nextjs";

/**
 * Captures API route exceptions to Sentry (when SENTRY_DSN is configured) with
 * structured route and user context, while logging locally for self-host debugging.
 */
export function captureApiError(
  route: string,
  error: unknown,
  context?: { userId?: string; extra?: Record<string, unknown> },
): void {
  console.error(`[API ${route}]`, error);

  if (process.env.SENTRY_DSN) {
    Sentry.withScope((scope) => {
      scope.setTag("api.route", route);
      if (context?.userId) {
        scope.setUser({ id: context.userId });
      }
      if (context?.extra) {
        scope.setExtras(context.extra);
      }
      Sentry.captureException(error);
    });
  }
}
