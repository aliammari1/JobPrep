/**
 * Service Worker with Push Notification Support
 * Handles service worker lifecycle, push events, and notification clicks
 */

// Cache names
const CACHE_NAME = "jobprep-v1";
const RUNTIME_CACHE = "jobprep-runtime";
const API_CACHE = "jobprep-api";

// Assets to cache on install
const ASSETS_TO_CACHE = [
  "/",
  "/offline.html",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

/**
 * Install event - cache essential assets
 */
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");

  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(ASSETS_TO_CACHE);
        console.log("[Service Worker] Assets cached");
        // Skip waiting to activate immediately
        await self.skipWaiting();
      } catch (error) {
        console.error("[Service Worker] Install error:", error);
      }
    })()
  );
});

/**
 * Activate event - cleanup old caches
 */
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");

  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        const cacheWhitelist = [CACHE_NAME, RUNTIME_CACHE, API_CACHE];

        const deletePromises = cacheNames
          .filter((cacheName) => !cacheWhitelist.includes(cacheName))
          .map((cacheName) => caches.delete(cacheName));

        await Promise.all(deletePromises);
        console.log("[Service Worker] Old caches cleaned up");

        // Claim clients immediately
        await self.clients.claim();
      } catch (error) {
        console.error("[Service Worker] Activate error:", error);
      }
    })()
  );
});

/**
 * Fetch event - handle network requests
 */
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Handle API calls separately
  if (url.pathname.startsWith("/api")) {
    return handleApiRequest(event);
  }

  // Handle other requests with network-first strategy
  event.respondWith(handleNetworkRequest(event));
});

/**
 * Attempt to fulfill an API fetch by using the network first, falling back to a cached response or an offline error.
 *
 * On a successful network response, the function caches the response in the API cache for future use.
 * If the network request fails, it serves a cached response when available and otherwise responds with a 503 offline response.
 *
 * @param {FetchEvent} event - The fetch event for an API request; its response is set via event.respondWith.
 */
async function handleApiRequest(event) {
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(event.request);

        // Cache successful responses
        if (response.ok) {
          const cache = await caches.open(API_CACHE);
          cache.put(event.request, response.clone());
        }

        return response;
      } catch (error) {
        // Return cached response if network fails
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Return offline response
        return new Response("Service unavailable - offline", { status: 503 });
      }
    })()
  );
}

/**
 * Serve a request using a network-first strategy with runtime caching and offline fallbacks.
 *
 * Attempts to fetch the request from the network, caches successful responses in the runtime
 * cache, and on network failure serves a cached response if available. For navigation requests,
 * returns the offline page from the persistent cache or a plain "Offline" response when no cache exists.
 *
 * @param {FetchEvent} event - The fetch event containing the request to handle.
 * @returns {Promise<Response>} The network response, a cached response, or an offline fallback response.
 * @throws {Error} Rethrows the original fetch error if the network fails and no cached or offline fallback is available.
 */
async function handleNetworkRequest(event) {
  try {
    const response = await fetch(event.request);

    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(event.request, response.clone());
    }

    return response;
  } catch (error) {
    // Try cache first on network error
    const cachedResponse = await caches.match(event.request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (event.request.mode === "navigate") {
      const cache = await caches.open(CACHE_NAME);
      return cache.match("/offline.html") || new Response("Offline");
    }

    throw error;
  }
}

/**
 * Push event - handle incoming push notifications
 */
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push notification received");

  if (!event.data) {
    console.warn("[Service Worker] Push event without data");
    return;
  }

  try {
    const data = event.data.json();
    const options = {
      body: data.body || "",
      icon: data.icon || "/icons/icon-192x192.png",
      badge: data.badge || "/icons/badge-72x72.png",
      tag: data.tag || "notification",
      requireInteraction: data.requireInteraction || false,
      actions: data.actions || [],
      data: data.data || {},
      vibrate: [100, 50, 100],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || "JobPrep", options)
    );
  } catch (error) {
    console.error("[Service Worker] Error handling push event:", error);
    // Show generic notification on parse error
    event.waitUntil(
      self.registration.showNotification("JobPrep Notification", {
        body: "You have a new notification",
        icon: "/icons/icon-192x192.png",
      })
    );
  }
});

/**
 * Notification click event - handle user interaction
 */
self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Notification clicked:", event.notification.tag);

  event.notification.close();

  const data = event.notification.data || {};
  const action = event.action || "default";

  // Handle notification click based on data
  event.waitUntil(
    (async () => {
      try {
        // Try to find existing client window
        const clients = await self.clients.matchAll({
          type: "window",
        });

        let client = null;

        // Look for existing window
        for (const c of clients) {
          if (c.url === "/" && "focus" in c) {
            client = c;
            break;
          }
        }

        // Create new window if not found
        if (!client && "openWindow" in self.clients) {
          client = await self.clients.openWindow(
            data.url || "/"
          );
        }

        // Focus existing window
        if (client && "focus" in client) {
          await client.focus();

          // Send message to client about notification click
          if ("postMessage" in client) {
            client.postMessage({
              type: "NOTIFICATION_CLICK",
              notification: event.notification.tag,
              action: action,
              data: data,
            });
          }
        }
      } catch (error) {
        console.error(
          "[Service Worker] Error handling notification click:",
          error
        );
      }
    })()
  );
});

/**
 * Notification close event - track dismissed notifications
 */
self.addEventListener("notificationclose", (event) => {
  console.log(
    "[Service Worker] Notification dismissed:",
    event.notification.tag
  );

  const data = event.notification.data || {};

  // Send dismissal event to server if needed
  if (data.trackDismissal) {
    fetch("/api/notifications/dismiss", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notificationId: data.id,
        notificationTag: event.notification.tag,
      }),
    }).catch((error) => {
      console.error("[Service Worker] Error tracking dismissal:", error);
    });
  }
});

/**
 * Background sync event - retry failed operations
 */
self.addEventListener("sync", (event) => {
  console.log("[Service Worker] Background sync:", event.tag);

  if (event.tag === "sync-notifications") {
    event.waitUntil(syncNotifications());
  }
});

/**
 * Synchronizes pending notifications with the server.
 *
 * Performs a POST to the notifications sync endpoint and throws on network
 * failure or non-OK responses so callers (or the service worker) can retry.
 * @throws {Error} If the network request fails or the server responds with a non-OK status.
 */
async function syncNotifications() {
  try {
    const response = await fetch("/api/notifications/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status}`);
    }

    console.log("[Service Worker] Notifications synced successfully");
  } catch (error) {
    console.error("[Service Worker] Error syncing notifications:", error);
    throw error; // Re-throw to trigger retry
  }
}

/**
 * Message event - handle messages from clients
 */
self.addEventListener("message", (event) => {
  console.log("[Service Worker] Message received:", event.data.type);

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data.type === "CLEAR_CACHES") {
    event.waitUntil(
      (async () => {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
        console.log("[Service Worker] All caches cleared");
      })()
    );
  }

  if (event.data.type === "CACHE_URLS") {
    event.waitUntil(
      (async () => {
        const cache = await caches.open(RUNTIME_CACHE);
        try {
          await cache.addAll(event.data.urls || []);
          console.log("[Service Worker] URLs cached");
        } catch (error) {
          console.error("[Service Worker] Error caching URLs:", error);
        }
      })()
    );
  }
});