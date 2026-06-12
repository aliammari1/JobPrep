import { withSentryConfig } from "@sentry/nextjs";
import withSerwistInit from "@serwist/next";

const isDev = process.env.NODE_ENV !== "production";

const withSerwist = withSerwistInit({
  // This is where the modern magic happens
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

// `unsafe-eval` is only required by the dev toolchain (HMR / React Refresh).
// Drop it in production builds to shrink the script-src attack surface.
const scriptSrc = [
  "script-src",
  "'self'",
  ...(isDev ? ["'unsafe-eval'"] : []),
  "'unsafe-inline'",
  "https://cdn.jsdelivr.net",
].join(" ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: process.cwd(),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "models.readyplayer.me" },
      { protocol: "https", hostname: "cdn.jsdelivr.net" },
      { protocol: "https", hostname: "media.licdn.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              scriptSrc,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://models.readyplayer.me https://cdn.jsdelivr.net https://media.licdn.com",
              "font-src 'self' data:",
              "connect-src 'self' https://models.readyplayer.me https://cdn.jsdelivr.net wss://*.livekit.cloud https://*.livekit.cloud https://api.heygen.com wss://api.heygen.com https://*.cloud.appwrite.io",
              "media-src 'self' blob: https://*.cloud.appwrite.io",
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
              "frame-src 'self' https://models.readyplayer.me",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

// Sentry wraps the build to upload source maps + instrument the server. It is
// inert at runtime unless SENTRY_DSN is configured; source-map upload only runs
// when SENTRY_AUTH_TOKEN is present (so CI/local builds without it are fine).
const config = withSerwist(nextConfig);

export default withSentryConfig(config, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  webpack: { treeshake: { removeDebugLogging: true } },
});
