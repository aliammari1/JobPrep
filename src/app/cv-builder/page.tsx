"use client";

import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import CanvaLayout from "@/components/cv-builder/CanvaLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";

export default function CVBuilderPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/sign-in?callbackUrl=/cv-builder");
    }
  }, [isPending, session, router]);

  if (isPending || !session) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 p-6">
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[70vh] rounded-xl" />
          <Skeleton className="h-[70vh] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0">
      <Suspense
        fallback={
          <div className="flex h-[70vh] items-center justify-center text-sm text-muted-foreground">
            Loading CV Builder…
          </div>
        }
      >
        <CanvaLayout />
      </Suspense>
    </div>
  );
}
