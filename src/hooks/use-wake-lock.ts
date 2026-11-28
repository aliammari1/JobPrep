"use client";

import { useEffect } from "react";

/**
 * Keeps the device screen awake during active practice, recording, or live
 * interview sessions, re-acquiring automatically when returning to the tab.
 */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (
      !active ||
      typeof navigator === "undefined" ||
      !("wakeLock" in navigator)
    ) {
      return;
    }

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        if (cancelled || document.visibilityState !== "visible") return;
        sentinel = await navigator.wakeLock.request("screen");
      } catch {
        // Ignore if battery saver or browser policy rejects wake lock
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void acquire();
      }
    };

    void acquire();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      if (sentinel && !sentinel.released) {
        void sentinel.release().catch(() => {});
      }
    };
  }, [active]);
}
