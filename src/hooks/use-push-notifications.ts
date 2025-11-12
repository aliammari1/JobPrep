/**
 * Hook for managing web push notifications in PWA
 * Handles service worker registration, push subscription, and notification management
 */

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface PushNotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  data?: Record<string, unknown>;
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  subscription: PushSubscription | null;
}

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export const usePushNotifications = () => {
  const [state, setState] = useState<PushNotificationState>({
    isSupported:
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window,
    isSubscribed: false,
    isLoading: false,
    error: null,
    subscription: null,
  });

  /**
   * Register service worker
   */
  const registerServiceWorker = useCallback(async () => {
    if (!state.isSupported) {
      setState((prev) => ({
        ...prev,
        error: "Push notifications are not supported in this browser",
      }));
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register(
        "/sw-push.js",
        {
          scope: "/",
        }
      );

      console.log("Service Worker registered successfully:", registration);
      return registration;
    } catch (error) {
      const errorMessage = `Failed to register service worker: ${error instanceof Error ? error.message : String(error)}`;
      console.error(errorMessage);
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
      toast.error("Failed to enable notifications");
      return null;
    }
  }, [state.isSupported]);

  /**
   * Request notification permission
   */
  const requestNotificationPermission = useCallback(async () => {
    if (!state.isSupported) {
      toast.error("Notifications not supported in this browser");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      setState((prev) => ({
        ...prev,
        error: "Notification permission denied",
      }));
      toast.error("Please enable notifications in your browser settings");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, [state.isSupported]);

  /**
   * Subscribe to push notifications
   */
  const subscribe = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Request permission first
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Notification permission required",
        }));
        return;
      }

      // Register service worker
      const registration = await registerServiceWorker();
      if (!registration) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
        }));
        return;
      }

      // Check if already subscribed
      const existingSubscription =
        await registration.pushManager.getSubscription();
      if (existingSubscription) {
        setState((prev) => ({
          ...prev,
          isSubscribed: true,
          subscription: existingSubscription,
          isLoading: false,
        }));
        toast.success("Already subscribed to notifications");
        return;
      }

      // Subscribe to push
      if (!VAPID_PUBLIC_KEY) {
        throw new Error("VAPID public key not configured");
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });

      // Send subscription to server
      await sendSubscriptionToServer(subscription);

      setState((prev) => ({
        ...prev,
        isSubscribed: true,
        subscription,
        isLoading: false,
      }));

      toast.success("Notifications enabled successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("Error subscribing to push notifications:", error);
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      toast.error("Failed to enable notifications");
    }
  }, [registerServiceWorker, requestNotificationPermission]);

  /**
   * Unsubscribe from push notifications
   */
  const unsubscribe = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Send unsubscription to server
        await sendUnsubscriptionToServer(subscription);

        // Unsubscribe from push
        await subscription.unsubscribe();

        setState((prev) => ({
          ...prev,
          isSubscribed: false,
          subscription: null,
          isLoading: false,
        }));

        toast.success("Unsubscribed from notifications");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("Error unsubscribing from push notifications:", error);
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      toast.error("Failed to disable notifications");
    }
  }, []);

  /**
   * Check current subscription status
   */
  const checkSubscriptionStatus = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      setState((prev) => ({
        ...prev,
        isSubscribed: !!subscription,
        subscription: subscription || null,
      }));

      return !!subscription;
    } catch (error) {
      console.error("Error checking subscription status:", error);
      return false;
    }
  }, []);

  /**
   * Show local notification (for testing or offline)
   */
  const showLocalNotification = useCallback(
    async (options: PushNotificationOptions) => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const notificationOptions: NotificationOptions = {
          body: options.body || "",
          icon: options.icon || "/icons/icon-192x192.png",
          badge: options.badge || "/icons/badge-72x72.png",
          tag: options.tag || "notification",
          requireInteraction: options.requireInteraction || false,
          data: options.data || {},
        };

        await registration.showNotification(options.title, notificationOptions);
      } catch (error) {
        console.error("Error showing notification:", error);
      }
    },
    []
  );

  /**
   * Initialize push notifications on mount
   */
  useEffect(() => {
    if (state.isSupported) {
      checkSubscriptionStatus();
    }
  }, [state.isSupported, checkSubscriptionStatus]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    checkSubscriptionStatus,
    showLocalNotification,
    isSupported: state.isSupported,
    isSubscribed: state.isSubscribed,
    isLoading: state.isLoading,
    error: state.error,
  };
};

/**
 * Convert VAPID public key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Send subscription to backend server
 */
async function sendSubscriptionToServer(
  subscription: PushSubscription
): Promise<void> {
  try {
    const response = await fetch("/api/notifications/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        userAgent: navigator.userAgent,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    console.log("Subscription sent to server successfully");
  } catch (error) {
    console.error("Error sending subscription to server:", error);
    throw error;
  }
}

/**
 * Send unsubscription to backend server
 */
async function sendUnsubscriptionToServer(
  subscription: PushSubscription
): Promise<void> {
  try {
    const response = await fetch("/api/notifications/unsubscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    console.log("Unsubscription sent to server successfully");
  } catch (error) {
    console.error("Error sending unsubscription to server:", error);
    throw error;
  }
}
