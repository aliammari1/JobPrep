export type SubscriptionTier = "FREE" | "MONTHLY" | "YEARLY";

export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: "Free",
    tier: "FREE" as SubscriptionTier,
    price: {
      monthly: 0,
      yearly: 0,
    },
    stripePriceId: {
      monthly: null,
      yearly: null,
    },
    features: {
      maxInterviewsPerMonth: 3,
      maxAIMockSessionsPerMonth: 5,
      maxCodeChallengesPerMonth: 10,
      aiInterviewer: false,
      videoRecording: false,
      aiAnalysis: false,
      cvBuilder: true,
      coverLetterGenerator: false,
      calendarIntegration: false,
      advancedAnalytics: false,
      prioritySupport: false,
      customBranding: false,
      teamCollaboration: false,
      exportReports: false,
      maxCVs: 1,
      maxCoverLetters: 0,
    },
    limits: {
      interviews: 3,
      aiMockSessions: 5,
      codeChallenges: 10,
      cvs: 1,
      coverLetters: 0,
    },
  },
  MONTHLY: {
    name: "Pro Monthly",
    tier: "MONTHLY" as SubscriptionTier,
    price: {
      monthly: 29.99,
      yearly: 0,
    },
    stripePriceId: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY!,
      yearly: null,
    },
    features: {
      maxInterviewsPerMonth: 50,
      maxAIMockSessionsPerMonth: 100,
      maxCodeChallengesPerMonth: 200,
      aiInterviewer: true,
      videoRecording: true,
      aiAnalysis: true,
      cvBuilder: true,
      coverLetterGenerator: true,
      calendarIntegration: true,
      advancedAnalytics: true,
      prioritySupport: true,
      customBranding: false,
      teamCollaboration: false,
      exportReports: true,
      maxCVs: 10,
      maxCoverLetters: 50,
    },
    limits: {
      interviews: 50,
      aiMockSessions: 100,
      codeChallenges: 200,
      cvs: 10,
      coverLetters: 50,
    },
  },
  YEARLY: {
    name: "Pro Yearly",
    tier: "YEARLY" as SubscriptionTier,
    price: {
      monthly: 0,
      yearly: 299.99, // Save ~17%
    },
    stripePriceId: {
      monthly: null,
      yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY!,
    },
    features: {
      maxInterviewsPerMonth: -1,
      maxAIMockSessionsPerMonth: -1,
      maxCodeChallengesPerMonth: -1,
      aiInterviewer: true,
      videoRecording: true,
      aiAnalysis: true,
      cvBuilder: true,
      coverLetterGenerator: true,
      calendarIntegration: true,
      advancedAnalytics: true,
      prioritySupport: true,
      customBranding: true,
      teamCollaboration: true,
      exportReports: true,
      maxCVs: -1, // Unlimited
      maxCoverLetters: -1, // Unlimited
    },
    limits: {
      interviews: -1, // -1 means unlimited
      aiMockSessions: -1,
      codeChallenges: -1,
      cvs: -1,
      coverLetters: -1,
    },
  },
} as const;

export type SubscriptionPlan =
  (typeof SUBSCRIPTION_PLANS)[keyof typeof SUBSCRIPTION_PLANS];

export function getPlanByTier(tier: SubscriptionTier): SubscriptionPlan {
  const plans: Record<SubscriptionTier, SubscriptionPlan> = SUBSCRIPTION_PLANS;
  return plans[tier];
}

export function getPlanByStripePriceId(
  priceId: string,
): SubscriptionPlan | null {
  for (const plan of Object.values(SUBSCRIPTION_PLANS)) {
    if (
      plan.stripePriceId.monthly === priceId ||
      plan.stripePriceId.yearly === priceId
    ) {
      return plan;
    }
  }
  return null;
}

export function canAccessFeature(
  userTier: SubscriptionTier,
  feature: keyof SubscriptionPlan["features"],
): boolean {
  const plan = getPlanByTier(userTier);
  return plan.features[feature] === true;
}

export function checkLimit(
  userTier: SubscriptionTier,
  limitType: keyof SubscriptionPlan["limits"],
  currentUsage: number,
): { allowed: boolean; limit: number; remaining: number } {
  const plan = getPlanByTier(userTier);
  const limit = plan.limits[limitType];

  // -1 means unlimited
  if (limit === -1) {
    return { allowed: true, limit: -1, remaining: -1 };
  }

  const remaining = Math.max(0, limit - currentUsage);
  return {
    allowed: currentUsage < limit,
    limit,
    remaining,
  };
}
