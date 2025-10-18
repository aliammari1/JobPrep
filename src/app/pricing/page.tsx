"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import {
  CheckCircle,
  X,
  Zap,
  Star,
  Crown,
  ArrowRight,
  Sparkles,
  HelpCircle,
} from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      { name: "5 practice interviews per month", included: true },
      { name: "Basic AI feedback", included: true },
      { name: "Video recording", included: true },
      { name: "Access to question library", included: true },
      { name: "Performance analytics dashboard", included: true },
      { name: "Advanced AI analysis", included: false },
      { name: "Collaborative features", included: false },
      { name: "Custom templates", included: false },
    ],
    cta: "Get Started",
    href: "/sign-up",
    popular: false,
    icon: Star,
    color: "from-gray-500 to-gray-600",
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    yearlyPrice: "$290",
    description: "For serious job seekers",
    features: [
      { name: "Unlimited practice interviews", included: true },
      { name: "Advanced AI analysis & insights", included: true },
      { name: "All interview formats (video, voice, code)", included: true },
      { name: "Custom question builder", included: true },
      { name: "Replay center with annotations", included: true },
      { name: "Priority email support", included: true },
      { name: "Export interview reports", included: true },
      { name: "Skill assessment & benchmarking", included: true },
    ],
    cta: "Start Free Trial",
    href: "/sign-up?plan=pro",
    popular: true,
    icon: Zap,
    color: "from-primary to-primary/60",
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For teams and organizations",
    features: [
      { name: "Everything in Pro", included: true },
      { name: "Collaborative evaluation tools", included: true },
      { name: "Team management dashboard", included: true },
      { name: "Custom branding", included: true },
      { name: "SSO & advanced security", included: true },
      { name: "API access", included: true },
      { name: "Dedicated account manager", included: true },
      { name: "Custom integrations", included: true },
      { name: "Unlimited team members", included: true },
      { name: "Advanced analytics & reporting", included: true },
    ],
    cta: "Contact Sales",
    href: "/contact?plan=enterprise",
    popular: false,
    icon: Crown,
    color: "from-purple-500 to-purple-600",
  },
];

const comparisonFeatures = [
  {
    category: "Core Features",
    items: [
      {
        name: "Practice interviews per month",
        free: "5",
        pro: "Unlimited",
        enterprise: "Unlimited",
      },
      {
        name: "AI feedback quality",
        free: "Basic",
        pro: "Advanced",
        enterprise: "Advanced",
      },
      {
        name: "Video recording quality",
        free: "720p",
        pro: "1080p",
        enterprise: "1080p",
      },
      { name: "Storage", free: "1GB", pro: "50GB", enterprise: "Unlimited" },
    ],
  },
  {
    category: "Interview Formats",
    items: [
      { name: "Video interviews", free: true, pro: true, enterprise: true },
      { name: "Voice interviews", free: false, pro: true, enterprise: true },
      { name: "Code challenges", free: false, pro: true, enterprise: true },
      { name: "Mock simulators", free: false, pro: true, enterprise: true },
    ],
  },
  {
    category: "Analytics & Insights",
    items: [
      {
        name: "Performance dashboard",
        free: true,
        pro: true,
        enterprise: true,
      },
      { name: "Advanced analytics", free: false, pro: true, enterprise: true },
      { name: "Skill assessment", free: false, pro: true, enterprise: true },
      { name: "Custom reports", free: false, pro: true, enterprise: true },
      { name: "Team analytics", free: false, pro: false, enterprise: true },
    ],
  },
  {
    category: "Collaboration",
    items: [
      { name: "Solo practice", free: true, pro: true, enterprise: true },
      { name: "Share recordings", free: false, pro: true, enterprise: true },
      { name: "Team evaluation", free: false, pro: false, enterprise: true },
      {
        name: "Multi-reviewer support",
        free: false,
        pro: false,
        enterprise: true,
      },
    ],
  },
  {
    category: "Support & Security",
    items: [
      {
        name: "Email support",
        free: "Community",
        pro: "Priority",
        enterprise: "Dedicated",
      },
      {
        name: "Response time",
        free: "48hrs",
        pro: "24hrs",
        enterprise: "4hrs",
      },
      { name: "SSO authentication", free: false, pro: false, enterprise: true },
      {
        name: "Custom integrations",
        free: false,
        pro: false,
        enterprise: true,
      },
    ],
  },
];

const faqs = [
  {
    question: "Can I switch plans anytime?",
    answer:
      "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes, we offer a 14-day free trial for the Pro plan. No credit card required to start.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards, PayPal, and can arrange invoicing for Enterprise customers.",
  },
  {
    question: "Can I cancel my subscription?",
    answer:
      "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.",
  },
  {
    question: "Do you offer discounts for students?",
    answer:
      "Yes! We offer a 50% discount for verified students. Contact us with your student email for more information.",
  },
  {
    question: "What's included in Enterprise support?",
    answer:
      "Enterprise customers get a dedicated account manager, priority support, custom onboarding, and regular check-ins to ensure success.",
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-8 md:px-12 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto text-center"
        >
          <Badge
            variant="outline"
            className="mb-6 backdrop-blur-sm border-primary/20"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-b from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            Choose Your Perfect Plan
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Start free and upgrade as you grow. All plans include core features
            to help you succeed.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <span
              className={
                billingCycle === "monthly"
                  ? "font-semibold"
                  : "text-muted-foreground"
              }
            >
              Monthly
            </span>
            <button
              onClick={() =>
                setBillingCycle(
                  billingCycle === "monthly" ? "yearly" : "monthly"
                )
              }
              className="relative w-14 h-7 bg-muted rounded-full transition-colors data-[state=checked]:bg-primary"
              data-state={billingCycle === "yearly" ? "checked" : "unchecked"}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-background rounded-full transition-transform ${
                  billingCycle === "yearly" ? "translate-x-7" : ""
                }`}
              />
            </button>
            <span
              className={
                billingCycle === "yearly"
                  ? "font-semibold"
                  : "text-muted-foreground"
              }
            >
              Yearly
              <Badge variant="secondary" className="ml-2">
                Save 15%
              </Badge>
            </span>
          </div>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 sm:px-8 md:px-12 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
              >
                <Card
                  className={`relative h-full ${
                    plan.popular
                      ? "border-primary shadow-lg scale-105 border-2"
                      : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-6 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-8 pt-8">
                    <div
                      className={`mx-auto p-3 rounded-full bg-gradient-to-br ${plan.color} w-fit mb-4`}
                    >
                      <plan.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                    <CardDescription className="text-base">
                      {plan.description}
                    </CardDescription>
                    <div className="mt-6">
                      <span className="text-5xl font-bold">{plan.price}</span>
                      {plan.period && (
                        <span className="text-muted-foreground text-lg">
                          {billingCycle === "yearly" ? "/year" : plan.period}
                        </span>
                      )}
                      {billingCycle === "yearly" && plan.yearlyPrice && (
                        <div className="text-sm text-muted-foreground mt-2">
                          Billed as {plan.yearlyPrice}/year
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Button
                      asChild
                      className={`w-full ${
                        plan.popular ? "" : "variant-outline"
                      }`}
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                    >
                      <Link href={plan.href}>
                        {plan.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>

                    <div className="space-y-3 pt-4">
                      {plan.features.map((feature, featureIdx) => (
                        <div
                          key={featureIdx}
                          className="flex items-start gap-3"
                        >
                          {typeof feature === "object" &&
                          "included" in feature ? (
                            feature.included ? (
                              <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground/50 shrink-0 mt-0.5" />
                            )
                          ) : (
                            <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          )}
                          <span
                            className={`text-sm ${
                              typeof feature === "object" &&
                              "included" in feature &&
                              !feature.included
                                ? "text-muted-foreground line-through"
                                : ""
                            }`}
                          >
                            {typeof feature === "object" && "name" in feature
                              ? feature.name
                              : feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="px-4 sm:px-8 md:px-12 py-16 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Detailed Feature Comparison
            </h2>
            <p className="text-lg text-muted-foreground">
              Compare all features across our plans
            </p>
          </div>

          <div className="bg-background rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Feature</TableHead>
                  <TableHead className="text-center">Free</TableHead>
                  <TableHead className="text-center bg-primary/5">
                    Pro
                  </TableHead>
                  <TableHead className="text-center">Enterprise</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonFeatures.map((category) => (
                  <>
                    <TableRow key={category.category} className="bg-muted/50">
                      <TableCell colSpan={4} className="font-semibold">
                        {category.category}
                      </TableCell>
                    </TableRow>
                    {category.items.map((item) => (
                      <TableRow key={item.name}>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {typeof item.free === "boolean" ? (
                            item.free ? (
                              <CheckCircle className="h-5 w-5 text-primary mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm">{item.free}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center bg-primary/5">
                          {typeof item.pro === "boolean" ? (
                            item.pro ? (
                              <CheckCircle className="h-5 w-5 text-primary mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm font-medium">
                              {item.pro}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {typeof item.enterprise === "boolean" ? (
                            item.enterprise ? (
                              <CheckCircle className="h-5 w-5 text-primary mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm font-medium">
                              {item.enterprise}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 sm:px-8 md:px-12 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {faqs.map((faq) => (
              <Card
                key={faq.question}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="text-lg flex items-start gap-2">
                    <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-8 md:px-12 py-16 bg-muted/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Still Have Questions?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Our team is here to help you find the perfect plan for your needs
          </p>
          <Button asChild size="lg" variant="outline" className="text-lg px-8">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
