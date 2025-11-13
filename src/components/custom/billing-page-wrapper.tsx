"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Suspense } from "react";

function BillingPageContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const sessionId = searchParams.get("session_id");

  // Refetch subscription and usage data when returning from Stripe checkout
  useEffect(() => {
    if (sessionId) {
      // Invalidate and refetch subscription data
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      queryClient.invalidateQueries({ queryKey: ["usage-stats"] });
      toast.success("Payment successful! Your subscription has been updated.");
    }
  }, [sessionId, queryClient]);

  return <>{children}</>;
}

export function BillingPageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>{children}</div>}>
      <BillingPageContent>{children}</BillingPageContent>
    </Suspense>
  );
}
