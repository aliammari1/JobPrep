/**
 * Progressive-enhancement haptic micro-pulses for Android Chrome / TWA.
 * Safely no-ops on browsers/platforms that do not expose Vibration API.
 */
export function triggerHaptic(
  pattern: "light" | "success" | "warning" = "light",
): void {
  if (
    typeof navigator === "undefined" ||
    typeof navigator.vibrate !== "function"
  ) {
    return;
  }
  try {
    if (pattern === "success") navigator.vibrate([12, 40, 18]);
    else if (pattern === "warning") navigator.vibrate([25, 40, 25]);
    else navigator.vibrate(12);
  } catch {
    // Ignore vibration errors in restricted contexts
  }
}
