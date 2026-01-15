"use client";

import { PricingCards } from "@/components/custom/pricing-cards";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { CheckCircle, Sparkles } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="mr-2 h-3 w-3" />
            Pricing Plans
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade as you grow. All plans include our core
            features with no hidden fees.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <PricingCards />
        </motion.div>

        {/* Features Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-24"
        >
          <h2 className="text-3xl font-bold text-center mb-12">
            What's Included in Each Plan
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              title="Free Plan"
              features={[
                "3 interviews per month",
                "5 AI mock sessions",
                "10 code challenges",
                "Basic CV builder (1 CV)",
                "Email support",
              ]}
            />
            <FeatureCard
              title="Pro Monthly"
              features={[
                "50 interviews per month",
                "100 AI mock sessions",
                "200 code challenges",
                "AI interviewer access",
                "Video recording & AI analysis",
                "Up to 10 CVs",
                "50 cover letters",
                "Calendar integration",
                "Advanced analytics",
                "Priority support",
                "Export reports",
              ]}
              highlighted
            />
            <FeatureCard
              title="Pro Yearly"
              features={[
                "Unlimited interviews",
                "Unlimited AI mock sessions",
                "Unlimited code challenges",
                "Everything in Pro Monthly",
                "Unlimited CVs & cover letters",
                "Custom branding",
                "Team collaboration",
                "Dedicated support",
                "Save 17% vs monthly",
              ]}
            />
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-24 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <FAQItem
              question="Can I switch plans anytime?"
              answer="Yes! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect at the start of your next billing cycle."
            />
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards (Visa, MasterCard, American Express) through our secure payment processor, Stripe."
            />
            <FAQItem
              question="Is there a free trial for premium plans?"
              answer="We offer a generous free tier so you can try our platform before upgrading. When you're ready for more features, you can upgrade to a premium plan."
            />
            <FAQItem
              question="What happens if I exceed my plan limits?"
              answer="You'll be notified when you approach your limits. You can either wait until the next billing cycle or upgrade to a higher plan to continue using premium features."
            />
            <FAQItem
              question="Do you offer refunds?"
              answer="We offer a 14-day money-back guarantee for all paid plans. If you're not satisfied, contact our support team for a full refund."
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  features,
  highlighted = false,
}: {
  title: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-6 ${
        highlighted ? "border-primary bg-primary/5" : "bg-card"
      }`}
    >
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 shrink-0 text-primary mt-0.5" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="font-semibold mb-2 flex items-start gap-2">
        <span className="text-primary">Q:</span>
        {question}
      </h3>
      <p className="text-muted-foreground text-sm pl-6">{answer}</p>
    </div>
  );
}
