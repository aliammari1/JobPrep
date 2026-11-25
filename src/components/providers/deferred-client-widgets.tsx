"use client";

import dynamic from "next/dynamic";

const Toaster = dynamic(
  () => import("@/components/ui/sonner").then((m) => m.Toaster),
  { ssr: false },
);

const OfflineDetector = dynamic(
  () =>
    import("@/components/custom/offline-detector").then(
      (m) => m.OfflineDetector,
    ),
  { ssr: false },
);

export function DeferredClientWidgets() {
  return (
    <>
      <Toaster position="top-right" richColors expand />
      <OfflineDetector />
    </>
  );
}
