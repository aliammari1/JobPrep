import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  // This is where the modern magic happens
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

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
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net",
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

export default withSerwist(nextConfig);
