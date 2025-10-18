import withPWA from "next-pwa";

const pwa = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: false, // Keep PWA enabled in development
  mode: "production", // CRITICAL: Force production mode for full caching in dev
  disableDevLogs: false,
  buildExcludes: [/middleware-manifest\.json$/],
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  
  // No fallback pages - all pages work offline with cached content
  // Use toast notifications for features requiring internet
  
  // Important: Don't exclude these from precaching
  publicExcludes: ["!manifest.json", "!icons/**/*", "!screenshots/**/*"],
  
  runtimeCaching: [
    // Cache start URL - try network first, fall back to cache
    {
      urlPattern: ({ url }) => url.pathname === "/",
      handler: "NetworkFirst",
      options: {
        cacheName: "start-url",
        expiration: {
          maxEntries: 1,
          maxAgeSeconds: 24 * 60 * 60,
        },
        networkTimeoutSeconds: 2,
      },
    },
    // Cache ALL pages (navigation requests) - critical for full offline functionality
    {
      urlPattern: ({ request }) => request.mode === "navigate",
      handler: "NetworkFirst",
      options: {
        cacheName: "pages-cache",
        expiration: {
          maxEntries: 100, // Increased to cache more pages
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
        networkTimeoutSeconds: 2,
      },
    },
    // Cache static Next.js assets aggressively
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "next-static",
        expiration: {
          maxEntries: 200, // Increased capacity
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    // Cache static assets (fonts, CSS, JS)
    {
      urlPattern: /\.(?:js|css|woff2?|ttf|otf|eot)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-assets",
        expiration: {
          maxEntries: 150,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    // Cache images with stale-while-revalidate
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "image-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    // Cache API routes - try network first, use cache as fallback
    // Toast notifications will inform users when API calls fail due to offline mode
    {
      urlPattern: /\/api\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
        networkTimeoutSeconds: 3,
      },
    },
    // Cache everything else from same origin
    {
      urlPattern: ({ url }) => url.origin === self.location.origin,
      handler: "NetworkFirst",
      options: {
        cacheName: "same-origin-cache",
        expiration: {
          maxEntries: 150,
          maxAgeSeconds: 24 * 60 * 60,
        },
        networkTimeoutSeconds: 2,
      },
    },
  ],
});

const nextConfig = {
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

export default pwa(nextConfig);
