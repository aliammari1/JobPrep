"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown } from "lucide-react";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-plans";
import { useCreateCheckoutSession, useSubscription } from "@/hooks/use-subscription";
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
      savings: undefined,
    },
    {
      ...SUBSCRIPTION_PLANS.MONTHLY,
      icon: Zap,
      popular: true,
      savings: undefined,
    },
    {
      ...SUBSCRIPTION_PLANS.YEARLY,
      icon: Crown,
      popular: false,
      savings: "Save 17%" as string | undefined,
    },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-3 lg:gap-6">
      {plans.map((plan) => {
        const isCurrentPlan = subscription?.tier === plan.tier;
        const Icon = plan.icon;
        const displayPrice = plan.price.monthly || plan.price.yearly;
        const billingPeriod = plan.price.monthly ? "month" : "year";

        return (
          <Card
            key={plan.tier}
            className={cn(
              "relative flex flex-col",
              plan.popular && "border-primary shadow-lg scale-105"
            )}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>
            )}
            {plan.savings && (
              <Badge
                variant="secondary"
                className="absolute -top-3 right-4"
              >
                {plan.savings}
              </Badge>
            )}
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon className="h-6 w-6" />
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
              </div>
              <CardDescription>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">
                    ${displayPrice}
                  </span>
                  {displayPrice > 0 && (
                    <span className="text-muted-foreground">/{billingPeriod}</span>
                  )}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm">
                    {plan.limits.interviews === -1
                      ? "Unlimited interviews"
                      : `${plan.limits.interviews} interviews/month`}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm">
                    {plan.limits.aiMockSessions === -1
                      ? "Unlimited AI mock sessions"
                      : `${plan.limits.aiMockSessions} AI mock sessions/month`}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm">
                    {plan.limits.codeChallenges === -1
                      ? "Unlimited code challenges"
                      : `${plan.limits.codeChallenges} code challenges/month`}
                  </span>
                </li>
                {plan.features.aiInterviewer && (
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">AI Interviewer</span>
                  </li>
                )}
                {plan.features.videoRecording && (
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">Video Recording</span>
                  </li>
                )}
                {plan.features.aiAnalysis && (
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">AI Analysis & Feedback</span>
                  </li>
                )}
                {plan.features.cvBuilder && (
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">
                      {plan.limits.cvs === -1
                        ? "Unlimited CVs"
                        : `${plan.limits.cvs} CV${plan.limits.cvs !== 1 ? "s" : ""}`}
                    </span>
                  </li>
                )}
                {plan.features.coverLetterGenerator && (
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">Cover Letter Generator</span>
                  </li>
                )}
                {plan.features.calendarIntegration && (
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">Calendar Integration</span>
                  </li>
                )}
                {plan.features.advancedAnalytics && (
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">Advanced Analytics</span>
                  </li>
                )}
                {plan.features.prioritySupport && (
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">Priority Support</span>
                  </li>
                )}
                {plan.features.customBranding && (
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">Custom Branding</span>
                  </li>
                )}
                {plan.features.teamCollaboration && (
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">Team Collaboration</span>
                  </li>
                )}
                {plan.features.exportReports && (
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">Export Reports</span>
                  </li>
                )}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                disabled={
                  isCurrentPlan ||
                  isPending ||
                  (plan.tier === "FREE" && true)
                }
                onClick={() => {
                  const priceId = plan.stripePriceId.monthly || plan.stripePriceId.yearly;
                  handleSubscribe(priceId);
                }}
              >
                {isCurrentPlan
                  ? "Current Plan"
                  : plan.tier === "FREE"
                    ? "Free Forever"
                    : "Subscribe"}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
