"use client";

import { SubscriptionManager } from "@/components/custom/subscription-manager";
import { BillingPageWrapper } from "@/components/custom/billing-page-wrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function BillingPage() {
  return (
    <BillingPageWrapper>
      <div className="container mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 md:py-8 lg:px-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Billing & Subscription</h1>
          <p className="text-muted-foreground mt-2">
            Manage your subscription, track your usage, and view your billing
            information
          </p>
        </div>

        <SubscriptionManager />

        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              About your limits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              • <strong>Usage resets</strong> monthly on your billing cycle date
            </p>
            <p>
              • <strong>Unlimited features</strong> on Pro Yearly plan never
              reset
            </p>
            <p>
              • <strong>Free plan</strong> includes limited features perfect for
              getting started
            </p>
            <p>
              • Contact support if you need higher limits for your organization
            </p>
            <Link href="/contact" className="text-primary hover:underline">
              → Contact Support
            </Link>
          </CardContent>
        </Card>
      </div>
    </BillingPageWrapper>
  );
}
