"use client";

import { useEffect } from "react";

/**
 * Tracks mobile virtual keyboard height via the Visual Viewport API and exposes
 * `--keyboard-inset` on `document.documentElement`. Bridges the iOS Safari gap
 * where `interactive-widget=resizes-content` does not resize the layout viewport.
 */
export function useKeyboardInset(): void {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      const inset = Math.max(
        0,
        Math.round(window.innerHeight - vv.height - vv.offsetTop),
      );
      document.documentElement.style.setProperty(
        "--keyboard-inset",
        `${inset > 80 ? inset : 0}px`,
      );
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      document.documentElement.style.setProperty("--keyboard-inset", "0px");
    };
  }, []);
}
