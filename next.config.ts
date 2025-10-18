import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: false,
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "offlineCache",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 24 * 60 * 60 * 30, // 30 days
        },
      },
    },
  ],
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'models.readyplayer.me',
      },
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
      },
      {
        protocol: 'https',
        hostname: 'media.licdn.com',
      },
    ],
  },
  // Allow loading scripts from CDN
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://models.readyplayer.me https://cdn.jsdelivr.net https://media.licdn.com",
              "font-src 'self' data:",
              "connect-src 'self' https://models.readyplayer.me https://cdn.jsdelivr.net wss://*.livekit.cloud https://*.livekit.cloud https://api.heygen.com wss://api.heygen.com",
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
              "frame-src 'self' https://models.readyplayer.me",
              "object-src 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default withPWA(nextConfig as any);
