"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import {
  getPlanByTier,
  canAccessFeature,
  checkLimit,
} from "@/lib/subscription-plans";
import type { SubscriptionTier } from "@/generated/prisma";

export async function getCurrentSubscription() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      subscriptionTier: true,
      subscriptionStatus: true,
      currentPeriodEnd: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    tier: user.subscriptionTier,
    status: user.subscriptionStatus,
    currentPeriodEnd: user.currentPeriodEnd,
    isActive:
      user.subscriptionStatus === "ACTIVE" ||
      user.subscriptionStatus === "TRIALING",
  };
}

export async function hasFeatureAccess(
  feature: string,
): Promise<{ allowed: boolean; tier: SubscriptionTier }> {
  const subscription = await getCurrentSubscription();

  if (!subscription) {
    return { allowed: false, tier: "FREE" };
  }

  const tier = subscription.tier;
  const plan = getPlanByTier(tier);

  // Check if feature exists in plan
  const featureKey = feature as keyof typeof plan.features;
  const hasAccess = plan.features[featureKey] === true;

  return {
    allowed: hasAccess && subscription.isActive,
    tier,
  };
}

export async function checkUsageLimit(
  limitType:
    | "interviews"
    | "aiMockSessions"
    | "codeChallenges"
    | "cvs"
    | "coverLetters",
): Promise<{
  allowed: boolean;
  limit: number;
  current: number;
  remaining: number;
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { allowed: false, limit: 0, current: 0, remaining: 0 };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { subscriptionTier: true, subscriptionStatus: true },
  });

  if (!user) {
    return { allowed: false, limit: 0, current: 0, remaining: 0 };
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let currentUsage = 0;

  switch (limitType) {
    case "interviews":
      currentUsage = await prisma.interview.count({
        where: {
          candidateId: session.user.id,
          createdAt: { gte: startOfMonth },
        },
      });
      break;
    case "aiMockSessions":
      currentUsage = await prisma.aIMockSession.count({
        where: {
          userId: session.user.id,
          createdAt: { gte: startOfMonth },
        },
      });
      break;
    case "cvs":
      // Implement based on your CV storage logic
      currentUsage = 0;
      break;
    case "coverLetters":
      // Implement based on your cover letter storage logic
      currentUsage = 0;
      break;
    case "codeChallenges":
      // Implement if you have a code challenges table
      currentUsage = 0;
      break;
  }

  const limitCheck = checkLimit(user.subscriptionTier, limitType, currentUsage);

  return {
    allowed: limitCheck.allowed,
    limit: limitCheck.limit,
    current: currentUsage,
    remaining: limitCheck.remaining,
  };
}

export async function requireFeatureAccess(feature: string): Promise<void> {
  const { allowed } = await hasFeatureAccess(feature);

  if (!allowed) {
    throw new Error(`Feature '${feature}' requires a premium subscription`);
  }
}

export async function requireUsageLimit(
  limitType:
    | "interviews"
    | "aiMockSessions"
    | "codeChallenges"
    | "cvs"
    | "coverLetters",
): Promise<void> {
  const { allowed, remaining } = await checkUsageLimit(limitType);

  if (!allowed) {
    throw new Error(
      `You have reached your ${limitType} limit. ${
        remaining === 0 ? "Upgrade to continue." : ""
      }`,
    );
  }
}
