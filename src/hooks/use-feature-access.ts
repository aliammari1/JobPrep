"use client";

import { useSubscription } from "./use-subscription";
import { canAccessFeature, checkLimit } from "@/lib/subscription-plans";
import type { SubscriptionPlan } from "@/lib/subscription-plans";

export function useFeatureAccess() {
  const { data: subscription, isLoading } = useSubscription();

  const hasFeature = (feature: keyof SubscriptionPlan["features"]) => {
    if (!subscription?.tier) return false;
    return canAccessFeature(subscription.tier, feature);
  };

  const checkFeatureLimit = (
    limitType: keyof SubscriptionPlan["limits"],
    currentUsage: number,
  ) => {
    if (!subscription?.tier) {
      return { allowed: false, limit: 0, remaining: 0 };
    }
    return checkLimit(subscription.tier, limitType, currentUsage);
  };

  const isPremium =
    subscription?.tier === "MONTHLY" || subscription?.tier === "YEARLY";
  const isFree = subscription?.tier === "FREE";
  const isYearly = subscription?.tier === "YEARLY";

  return {
    subscription,
    isLoading,
    hasFeature,
    checkFeatureLimit,
    isPremium,
    isFree,
    isYearly,
    tier: subscription?.tier,
    status: subscription?.status,
  };
}
