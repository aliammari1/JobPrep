"use client";

import { Suspense } from "react";
import CanvaLayout from "@/components/cv-builder/CanvaLayout";

export default function CVBuilderPage() {
  return (
    <div className="min-h-screen">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            Loading...
          </div>
        }
      >
        <CanvaLayout />
      </Suspense>
    </div>
  );
}
