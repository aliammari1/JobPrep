"use client";

/**
 * App Router route-segment error boundary. Catches render/runtime errors in
 * the page tree, reports them to Sentry (no-op unless configured), and offers a
 * recovery action.
 */
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <p className="max-w-md text-muted-foreground">
        An unexpected error occurred. You can try again — if the problem
        persists, please report it on GitHub.
      </p>
      {error.digest ? (
        <code className="rounded bg-muted px-2 py-1 text-xs">
          ref: {error.digest}
        </code>
      ) : null}
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
