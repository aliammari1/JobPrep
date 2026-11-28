type PlatformSignals = Pick<
  Navigator,
  "maxTouchPoints" | "platform" | "userAgent"
>;

export function detectMobilePlatform({
  maxTouchPoints,
  platform,
  userAgent,
}: PlatformSignals): "android" | "ios" | undefined {
  if (/Android/i.test(userAgent)) return "android";

  // iPadOS can request desktop sites with a Mac user agent.
  const isDesktopModeIPad =
    maxTouchPoints > 1 &&
    (platform === "MacIntel" || /Macintosh/i.test(userAgent));

  if (/iPhone|iPad|iPod/i.test(userAgent) || isDesktopModeIPad) return "ios";
}
