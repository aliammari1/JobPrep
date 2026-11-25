"use client";

import { Check, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useCreateCheckoutSession,
  useSubscription,
} from "@/hooks/use-subscription";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-plans";
import { cn } from "@/lib/utils";

export function PricingCards() {
  const { data: subscription } = useSubscription();
  const { mutate: createCheckout, isPending } = useCreateCheckoutSession();

  const handleSubscribe = (priceId: string | null) => {
    if (!priceId) return;
    createCheckout(priceId);
  };

  const plans = [
    {
      ...SUBSCRIPTION_PLANS.FREE,
      icon: Check,
      popular: false,
      tagline: "For exploring mock sessions and building your first CV.",
      savings: undefined,
    },
    {
      ...SUBSCRIPTION_PLANS.MONTHLY,
      icon: Zap,
      popular: true,
      tagline:
        "For active interview loops with full AI coaching and recordings.",
      savings: undefined,
    },
    {
      ...SUBSCRIPTION_PLANS.YEARLY,
      icon: Crown,
      popular: false,
      tagline: "Unlimited practice, team collaboration, and best annual value.",
      savings: "Save 17%" as string | undefined,
    },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
      {plans.map((plan) => {
        const isCurrentPlan = subscription?.tier === plan.tier;
        const displayPrice = plan.price.monthly || plan.price.yearly;
        const billingPeriod = plan.price.monthly ? "month" : "year";

        const featureList: string[] = [
          plan.limits.interviews === -1
            ? "Unlimited interviews"
            : `${plan.limits.interviews} interviews / month`,
          plan.limits.aiMockSessions === -1
            ? "Unlimited AI mock sessions"
            : `${plan.limits.aiMockSessions} AI mock sessions / month`,
          plan.limits.codeChallenges === -1
            ? "Unlimited code challenges"
            : `${plan.limits.codeChallenges} code challenges / month`,
          ...(plan.features.aiInterviewer ? ["AI Interviewer & Rubric"] : []),
          ...(plan.features.videoRecording ? ["Video Recording & Replay"] : []),
          ...(plan.features.aiAnalysis ? ["Detailed AI Analysis"] : []),
          ...(plan.features.cvBuilder
            ? [
                plan.limits.cvs === -1
                  ? "Unlimited CVs"
                  : `${plan.limits.cvs} CV${plan.limits.cvs !== 1 ? "s" : ""}`,
              ]
            : []),
          ...(plan.features.coverLetterGenerator
            ? ["Cover Letter Generator"]
            : []),
          ...(plan.features.calendarIntegration
            ? ["Calendar Integration"]
            : []),
          ...(plan.features.advancedAnalytics ? ["Performance Analytics"] : []),
          ...(plan.features.teamCollaboration ? ["Team Collaboration"] : []),
          ...(plan.features.prioritySupport ? ["Priority Support"] : []),
        ];

        return (
          <div
            key={plan.tier}
            className={cn(
              "relative flex flex-col justify-between rounded-2xl border p-7 transition-colors",
              plan.popular
                ? "border-[#2563eb] bg-[#090b10] text-white shadow-xl shadow-black/15 dark:border-[#3b82f6]"
                : "border-border bg-card text-foreground",
            )}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <h2
                  className={cn(
                    "font-display text-2xl font-bold tracking-tight",
                    plan.popular ? "text-white" : "text-foreground",
                  )}
                >
                  {plan.name}
                </h2>
                {plan.popular && (
                  <span className="rounded-full bg-[#2563eb] px-2.5 py-0.5 text-xs font-semibold text-white">
                    Recommended
                  </span>
                )}
                {plan.savings && (
                  <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                    {plan.savings}
                  </span>
                )}
              </div>

              <p
                className={cn(
                  "mt-2 text-sm",
                  plan.popular ? "text-white/70" : "text-muted-foreground",
                )}
              >
                {plan.tagline}
              </p>

              <div
                className={cn(
                  "mt-6 flex items-baseline gap-1 border-b pb-6",
                  plan.popular ? "border-white/15" : "border-border",
                )}
              >
                <span
                  className={cn(
                    "font-display text-4xl font-bold tracking-tight tabular-nums",
                    plan.popular ? "text-white" : "text-foreground",
                  )}
                >
                  ${displayPrice}
                </span>
                {displayPrice > 0 ? (
                  <span
                    className={cn(
                      "text-sm",
                      plan.popular ? "text-white/60" : "text-muted-foreground",
                    )}
                  >
                    /{billingPeriod}
                  </span>
                ) : (
                  <span
                    className={cn(
                      "text-sm",
                      plan.popular ? "text-white/60" : "text-muted-foreground",
                    )}
                  >
                    forever
                  </span>
                )}
              </div>

              <ul className="mt-6 space-y-2.5">
                {featureList.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm">
                    <Check
                      className={cn(
                        "mt-0.5 size-4 shrink-0",
                        plan.popular ? "text-[#60a5fa]" : "text-primary",
                      )}
                    />
                    <span
                      className={
                        plan.popular ? "text-white/90" : "text-foreground/90"
                      }
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-4">
              <Button
                className={cn(
                  "h-11 w-full font-medium",
                  plan.popular &&
                    "bg-[#2563eb] text-white hover:bg-[#1d4ed8] border-0",
                )}
                variant={plan.popular ? "default" : "outline"}
                disabled={isCurrentPlan || isPending || plan.tier === "FREE"}
                onClick={() => {
                  const priceId =
                    plan.stripePriceId.monthly || plan.stripePriceId.yearly;
                  handleSubscribe(priceId);
                }}
              >
                {isCurrentPlan
                  ? "Current plan"
                  : plan.tier === "FREE"
                    ? "Included free"
                    : "Upgrade now"}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
