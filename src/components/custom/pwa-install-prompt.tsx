"use client";

import { Share, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa-install-dismissed";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function wasDismissedRecently(): boolean {
  try {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (!dismissed) return false;
    return Date.now() - Number.parseInt(dismissed, 10) < SEVEN_DAYS_MS;
  } catch {
    return false;
  }
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (wasDismissedRecently()) return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;
    if (isStandalone) return;

    const isIos =
      /iPhone|iPad|iPod/i.test(window.navigator.userAgent) &&
      !/CriOS|FxiOS/i.test(window.navigator.userAgent);

    if (isIos) {
      setShowIosHint(true);
      return;
    }

    const handler = (e: Event) => {
      if (wasDismissedRecently()) return;
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIosHint(false);
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch {
      // Ignore storage errors
    }
  };

  if (!showIosHint && (!showPrompt || !deferredPrompt)) return null;

  return (
    <div
      role="region"
      aria-label="Install JobPrep app"
      className="fixed right-3 bottom-20 left-3 z-40 mx-auto max-w-sm lg:right-4 lg:bottom-4 lg:left-auto"
    >
      <div className="rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-sm font-semibold text-foreground">
              Install JobPrep
            </h3>
            {showIosHint ? (
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Tap{" "}
                <Share
                  className="inline size-3.5 align-text-bottom text-primary"
                  aria-hidden="true"
                />{" "}
                <strong className="text-foreground">Share</strong> then{" "}
                <strong className="text-foreground">Add to Home Screen</strong>{" "}
                for full-screen app mode.
              </p>
            ) : (
              <>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Quick access &amp; offline support from your home screen.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleInstallClick}
                    className="flex-1"
                  >
                    Install
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleDismiss}
                  >
                    Later
                  </Button>
                </div>
              </>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Dismiss install prompt"
            onClick={handleDismiss}
            className="shrink-0 text-muted-foreground"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
