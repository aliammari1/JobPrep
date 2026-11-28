"use client";

import { formatDate } from "date-fns";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bot,
  Check,
  Code2,
  CreditCard,
  Crown,
  FileText,
  Loader2,
  Mail,
  TriangleAlert,
  Video,
  Zap,
} from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useDowngradeSubscription,
  useManageBilling,
  useSubscription,
  useUpgradeSubscription,
  useUsageStats,
} from "@/hooks/use-subscription";
import {
  checkLimit,
  getPlanByTier,
  SUBSCRIPTION_PLANS,
} from "@/lib/subscription-plans";

export function SubscriptionManager() {
  const { data: subscription, isLoading } = useSubscription();
  const { data: usage } = useUsageStats();
  const { mutate: openBillingPortal, isPending: billingPending } =
    useManageBilling();
  const { mutate: upgradeSubscription, isPending: upgradePending } =
    useUpgradeSubscription();
  const { mutate: downgradeSubscription, isPending: downgradePending } =
    useDowngradeSubscription();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState<
    "MONTHLY" | "YEARLY" | null
  >(null);
  const [showDowngradeDialog, setShowDowngradeDialog] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return null;
  }

  const plan = getPlanByTier(subscription.tier);
  const isActive =
    subscription.status === "ACTIVE" || subscription.status === "TRIALING";
  const isPastDue = subscription.status === "PAST_DUE";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500";
      case "TRIALING":
        return "bg-blue-500";
      case "PAST_DUE":
        return "bg-yellow-500";
      case "CANCELED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const usageItems = [
    {
      label: "Interviews",
      current: usage?.interviews || 0,
      limit: plan.limits.interviews,
      icon: Video,
    },
    {
      label: "AI Mock Sessions",
      current: usage?.aiMockSessions || 0,
      limit: plan.limits.aiMockSessions,
      icon: Bot,
    },
    {
      label: "Code Challenges",
      current: usage?.codeChallenges || 0,
      limit: plan.limits.codeChallenges,
      icon: Code2,
    },
    {
      label: "CVs",
      current: usage?.cvs || 0,
      limit: plan.limits.cvs,
      icon: FileText,
    },
    {
      label: "Cover Letters",
      current: usage?.coverLetters || 0,
      limit: plan.limits.coverLetters,
      icon: Mail,
    },
  ];

  const handleUpgrade = (tier: "MONTHLY" | "YEARLY") => {
    setShowUpgradeDialog(tier);
  };

  const confirmUpgrade = () => {
    if (showUpgradeDialog) {
      upgradeSubscription(showUpgradeDialog);
      setShowUpgradeDialog(null);
    }
  };

  const confirmDowngrade = () => {
    downgradeSubscription();
    setShowDowngradeDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Subscription</span>
            <Badge className={getStatusColor(subscription.status)}>
              {subscription.tier === "FREE" &&
              subscription.status === "INACTIVE"
                ? "Free"
                : subscription.status.charAt(0) +
                  subscription.status.slice(1).toLowerCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Plan</p>
              <h3 className="text-3xl font-bold">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {subscription.tier === "FREE"
                  ? "Free forever"
                  : `$${plan.price.monthly || plan.price.yearly}/${plan.price.monthly ? "month" : "year"}`}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Billing Period
              </p>
              {isActive && subscription.currentPeriodEnd ? (
                <div>
                  {subscription.cancelAtPeriodEnd ? (
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      Ends{" "}
                      {formatDate(subscription.currentPeriodEnd, "MMM d, yyyy")}
                    </p>
                  ) : (
                    <p className="text-sm font-medium">
                      Next billing:{" "}
                      {formatDate(subscription.currentPeriodEnd, "MMM d, yyyy")}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">N/A</p>
              )}
            </div>
          </div>

          {isPastDue && (
            <div className="flex items-start gap-2 rounded-lg bg-yellow-500/10 p-4 text-sm text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Your payment is past due. Update your payment method to continue
                using premium features.
              </span>
            </div>
          )}

          {subscription.tier !== "FREE" && (
            <Button
              onClick={() => openBillingPortal()}
              disabled={billingPending}
              variant="outline"
              className="w-full"
            >
              {billingPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Payment Methods & Invoices
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Usage Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Usage This Month
          </CardTitle>
          <CardDescription>
            {subscription.tier === "FREE" ? (
              <>
                You&apos;re on the free plan.{" "}
                <a
                  href="#plans"
                  className="font-medium text-primary hover:underline"
                >
                  Upgrade to unlock more features
                </a>
                .
              </>
            ) : (
              "Your current usage and limits"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {usageItems.map((item) => {
            const isUnlimited = item.limit === -1;
            const notIncluded = item.limit === 0;
            const percentage =
              isUnlimited || notIncluded
                ? 0
                : (item.current / item.limit) * 100;
            const isNearLimit =
              percentage >= 80 && !isUnlimited && !notIncluded;
            const isExceeded =
              item.current > item.limit && !isUnlimited && !notIncluded;
            const Icon = item.icon;

            return (
              <div key={item.label} className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted">
                      <Icon className="size-4 text-muted-foreground" />
                    </span>
                    <span className="truncate font-medium">{item.label}</span>
                  </div>
                  <span
                    className={`shrink-0 font-semibold tabular-nums ${isExceeded ? "text-red-600 dark:text-red-400" : isNearLimit ? "text-orange-600 dark:text-orange-400" : notIncluded ? "text-muted-foreground" : ""}`}
                  >
                    {notIncluded
                      ? "Not included"
                      : `${item.current} / ${isUnlimited ? "∞" : item.limit}`}
                  </span>
                </div>
                {!isUnlimited && !notIncluded && (
                  <div className="space-y-1">
                    <Progress
                      value={Math.min(percentage, 100)}
                      className="h-2"
                    />
                    {isNearLimit && !isExceeded && (
                      <p className="text-xs text-orange-600 dark:text-orange-400">
                        {Math.round(100 - percentage)}% remaining
                      </p>
                    )}
                    {isExceeded && (
                      <p className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                        <TriangleAlert className="h-3 w-3" />
                        Limit exceeded by {item.current - item.limit}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Plan Selection */}
      <Card id="plans" className="scroll-mt-6">
        <CardHeader>
          <CardTitle>Upgrade your plan</CardTitle>
          <CardDescription>
            Choose the plan that works best for you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue={subscription.tier === "FREE" ? "monthly" : "current"}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="free">Free</TabsTrigger>
              <TabsTrigger value="monthly">Pro Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Pro Yearly</TabsTrigger>
            </TabsList>

            {/* Free Plan */}
            <TabsContent value="free" className="mt-4">
              <PlanCard
                plan={SUBSCRIPTION_PLANS.FREE}
                isCurrentPlan={subscription.tier === "FREE"}
                onSelect={() => {
                  if (subscription.tier !== "FREE") {
                    setShowDowngradeDialog(true);
                  }
                }}
                isPending={downgradePending}
              />
            </TabsContent>

            {/* Monthly Plan */}
            <TabsContent value="monthly" className="mt-4">
              <PlanCard
                plan={SUBSCRIPTION_PLANS.MONTHLY}
                isCurrentPlan={subscription.tier === "MONTHLY"}
                onSelect={() => handleUpgrade("MONTHLY")}
                isPending={upgradePending}
              />
            </TabsContent>

            {/* Yearly Plan */}
            <TabsContent value="yearly" className="mt-4">
              <PlanCard
                plan={SUBSCRIPTION_PLANS.YEARLY}
                isCurrentPlan={subscription.tier === "YEARLY"}
                onSelect={() => handleUpgrade("YEARLY")}
                isPending={upgradePending}
                savings="Save 17%"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Upgrade Confirmation Dialog */}
      <AlertDialog
        open={showUpgradeDialog !== null}
        onOpenChange={(open) => !open && setShowUpgradeDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upgrade Your Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              You're upgrading to{" "}
              {showUpgradeDialog === "MONTHLY"
                ? "Pro Monthly ($29.99/month)"
                : "Pro Yearly ($299.99/year)"}
              . Your plan will be activated immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <p className="text-sm font-medium mb-2">Benefits:</p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✓ Unlimited interviews</li>
              <li>✓ Unlimited AI mock sessions</li>
              <li>✓ Advanced analytics</li>
              <li>✓ Priority support</li>
            </ul>
          </div>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmUpgrade} disabled={upgradePending}>
            {upgradePending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Upgrading...
              </>
            ) : (
              <>
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Upgrade Now
              </>
            )}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      {/* Downgrade Confirmation Dialog */}
      <AlertDialog
        open={showDowngradeDialog}
        onOpenChange={setShowDowngradeDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Downgrade to Free Plan</AlertDialogTitle>
            <AlertDialogDescription>
              You'll lose access to premium features at the end of your current
              billing period.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2 bg-orange-500/10 rounded-lg p-3 border border-orange-500/20">
            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
              ⚠️ You'll lose access to:
            </p>
            <ul className="text-sm space-y-1 text-orange-600 dark:text-orange-400 mt-2">
              <li>• AI interview analysis</li>
              <li>• Extended usage limits</li>
              <li>• Priority support</li>
            </ul>
          </div>
          <AlertDialogCancel>Keep Current Plan</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDowngrade}
            disabled={downgradePending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {downgradePending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downgrading...
              </>
            ) : (
              <>
                <ArrowDownLeft className="mr-2 h-4 w-4" />
                Downgrade
              </>
            )}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface PlanCardProps {
  plan: any;
  isCurrentPlan: boolean;
  onSelect: () => void;
  isPending?: boolean;
  savings?: string;
}

function PlanCard({
  plan,
  isCurrentPlan,
  onSelect,
  isPending,
  savings,
}: PlanCardProps) {
  const Icon =
    plan.tier === "FREE" ? Check : plan.tier === "YEARLY" ? Crown : Zap;

  return (
    <div
      className={`rounded-lg border-2 p-6 ${isCurrentPlan ? "border-primary bg-primary/5" : "border-border"}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="h-6 w-6" />
          <h3 className="text-xl font-bold">{plan.name}</h3>
        </div>
        {savings && <Badge variant="secondary">{savings}</Badge>}
      </div>

      <div className="mb-4">
        <p className="text-3xl font-bold">
          ${plan.price.monthly || plan.price.yearly}
        </p>
        <p className="text-sm text-muted-foreground">
          {plan.price.monthly ? "per month" : "per year"}
        </p>
      </div>

      <ul className="space-y-2 mb-6">
        <li className="text-sm flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500" />
          {plan.limits.interviews === -1
            ? "Unlimited interviews"
            : `${plan.limits.interviews} interviews/month`}
        </li>
        <li className="text-sm flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500" />
          {plan.limits.aiMockSessions === -1
            ? "Unlimited AI sessions"
            : `${plan.limits.aiMockSessions} AI sessions/month`}
        </li>
        <li className="text-sm flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500" />
          {plan.limits.cvs === -1 ? "Unlimited CVs" : `${plan.limits.cvs} CVs`}
        </li>
        {plan.features.videoRecording && (
          <li className="text-sm flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            Video recording & analysis
          </li>
        )}
        {plan.features.prioritySupport && (
          <li className="text-sm flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            Priority support
          </li>
        )}
      </ul>

      <Button
        onClick={onSelect}
        disabled={isCurrentPlan || isPending}
        className="w-full"
        variant={isCurrentPlan ? "outline" : "default"}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : isCurrentPlan ? (
          "Current Plan"
        ) : plan.tier === "FREE" ? (
          "Downgrade"
        ) : (
          "Upgrade"
        )}
      </Button>
    </div>
  );
}
