"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * Hook to check if the user is online or offline
 * Also shows toast notifications when offline mode is detected
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Show toast notification when user tries to use a feature that requires internet
 */
export function showOfflineToast(featureName?: string) {
  toast.error("You're in offline mode", {
    description: featureName
      ? `${featureName} requires an internet connection`
      : "This feature requires an internet connection",
    duration: 4000,
  });
}

/**
 * Higher-order function to wrap async functions with offline detection
 * Shows toast if offline and prevents execution
 */
export function withOfflineCheck<
  T extends (...args: unknown[]) => Promise<unknown>,
>(fn: T, featureName?: string): T {
  return (async (...args: Parameters<T>) => {
    if (!navigator.onLine) {
      showOfflineToast(featureName);
      throw new Error("Offline mode - operation cancelled");
    }
    return await fn(...args);
  }) as T;
}
