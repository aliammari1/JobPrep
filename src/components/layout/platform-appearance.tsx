"use client";

import { useLayoutEffect } from "react";
import { useKeyboardInset } from "@/hooks/use-keyboard-inset";
import { detectMobilePlatform } from "./mobile-platform";

export function PlatformAppearance() {
  useKeyboardInset();

  useLayoutEffect(() => {
    const platform = detectMobilePlatform(navigator);
    if (platform) document.documentElement.dataset.jobprepPlatform = platform;
  }, []);

  return null;
}
