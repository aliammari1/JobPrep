"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

const tabRoots = new Set([
  "/dashboard",
  "/mock-interview",
  "/applications",
  "/cv-builder",
  "/more",
]);

interface WorkspaceEntry {
  path: string;
  index: number;
  canGoBack: boolean;
}

function parentPath(path: string) {
  if (path.startsWith("/saved-interviews/")) return "/recordings";
  if (path === "/mock-interview/questions") return "/mock-interview";
  if (path === "/code-challenge/onboarding") return "/code-challenge";
  return "/more";
}

export function useWorkspaceNavigation(path: string, enabled: boolean) {
  const router = useRouter();
  const mainRef = useRef<HTMLElement>(null);
  const currentEntry = useRef<WorkspaceEntry | null>(null);
  const scrollPositions = useRef(new Map<number, number>());

  useLayoutEffect(() => {
    const panel = mainRef.current;
    if (!enabled || !panel) {
      currentEntry.current = null;
      scrollPositions.current.clear();
      return;
    }

    const previous = currentEntry.current;
    if (previous?.path === path) return;

    const savedEntry = window.history.state?.jobprepWorkspace as
      | WorkspaceEntry
      | undefined;
    const restoring = savedEntry?.path === path;
    const entry = restoring
      ? savedEntry
      : {
          path,
          index: (previous?.index ?? -1) + 1,
          canGoBack: Boolean(previous),
        };

    if (!restoring) {
      for (const key of scrollPositions.current.keys()) {
        if (key >= entry.index) scrollPositions.current.delete(key);
      }
      window.history.replaceState(
        { ...window.history.state, jobprepWorkspace: entry },
        "",
      );
    }

    currentEntry.current = entry;
    panel.scrollTo({
      top: restoring ? (scrollPositions.current.get(entry.index) ?? 0) : 0,
      behavior: "instant",
    });

    const mobile = window.matchMedia("(max-width: 1023px)");
    if (!previous || !mobile.matches) return;

    panel.focus({ preventScroll: true });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tabChange = tabRoots.has(path) && !restoring;
    const backwards = entry.index < previous.index;
    const ios = document.documentElement.dataset.jobprepPlatform === "ios";
    const distance = tabChange ? 0 : backwards ? -12 : 12;

    const animation = panel.animate(
      [
        {
          opacity: ios ? 0.76 : 0.85,
          transform: ios
            ? `translateX(${distance}px)`
            : `translateY(${distance / 2}px)`,
        },
        { opacity: 1, transform: "none" },
      ],
      { duration: ios ? 240 : 190, easing: "cubic-bezier(0.2, 0.75, 0.3, 1)" },
    );
    return () => animation.cancel();
  }, [enabled, path]);

  useEffect(() => {
    const panel = mainRef.current;
    if (!panel || !enabled) return;
    const savePosition = () => {
      const entry = currentEntry.current;
      if (entry) scrollPositions.current.set(entry.index, panel.scrollTop);
    };
    panel.addEventListener("scroll", savePosition, { passive: true });
    return () => panel.removeEventListener("scroll", savePosition);
  }, [enabled]);

  const onBack = tabRoots.has(path)
    ? undefined
    : () => {
        if (currentEntry.current?.canGoBack) router.back();
        else {
          currentEntry.current = null;
          router.replace(parentPath(path), { scroll: false });
        }
      };

  return { mainRef, onBack };
}
