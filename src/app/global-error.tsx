"use client";

/**
 * Root error boundary — catches errors thrown in the root layout itself, where
 * the normal `error.tsx` boundary can't render. Must include its own
 * <html>/<body>. Reports to Sentry (no-op unless configured).
 */
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "system-ui, sans-serif",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", fontWeight: 600 }}>
          Something went wrong
        </h2>
        <p style={{ maxWidth: "28rem", color: "#666" }}>
          A critical error occurred while loading the application. Please try
          again.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            borderRadius: "0.375rem",
            background: "#111",
            color: "#fff",
            border: "none",
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
