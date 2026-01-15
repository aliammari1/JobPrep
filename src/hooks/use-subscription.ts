"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface SubscriptionData {
  tier: "FREE" | "MONTHLY" | "YEARLY";
  status: "ACTIVE" | "INACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING";
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

export function useSubscription() {
  return useQuery<SubscriptionData>({
    queryKey: ["subscription"],
    queryFn: async () => {
      const response = await fetch("/api/subscription");
      if (!response.ok) {
        throw new Error("Failed to fetch subscription");
      }
      const data = await response.json();
      return {
        ...data,
        currentPeriodEnd: data.currentPeriodEnd
          ? new Date(data.currentPeriodEnd)
          : null,
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

export function useCreateCheckoutSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (priceId: string) => {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast.error("Failed to start checkout. Please try again.");
    },
  });
}

export function useManageBilling() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to create portal session");
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast.error("Failed to open billing portal. Please try again.");
    },
  });
}

export function useUsageStats() {
  return useQuery({
    queryKey: ["usage-stats"],
    queryFn: async () => {
      const response = await fetch("/api/subscription/usage");
      if (!response.ok) {
        throw new Error("Failed to fetch usage stats");
      }
      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

export function useUpgradeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tier: "MONTHLY" | "YEARLY") => {
      const response = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upgrade subscription");
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        toast.success("Subscription updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["subscription"] });
        queryClient.invalidateQueries({ queryKey: ["usage-stats"] });
      }
    },
    onError: (error: any) => {
      toast.error(
        error.message || "Failed to update subscription. Please try again.",
      );
    },
  });
}

export function useDowngradeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/subscription/downgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to downgrade subscription");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      queryClient.invalidateQueries({ queryKey: ["usage-stats"] });
      toast.success("Subscription downgraded successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.message || "Failed to downgrade subscription. Please try again.",
      );
    },
  });
}
