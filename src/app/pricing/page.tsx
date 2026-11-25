"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { PricingCards } from "@/components/custom/pricing-cards";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const FAQS = [
  {
    question: "Can I switch or cancel plans anytime?",
    answer:
      "Yes. You can upgrade, downgrade, or cancel at any time from Billing settings. Changes take effect at the start of your next billing cycle.",
  },
  {
    question: "Can I use my own AI API key or run locally?",
    answer:
      "Yes. JobPrep supports bring-your-own-key for Anthropic, OpenAI, and Gemini, as well as fully offline local inference with Ollama.",
  },
  {
    question: "What payment methods are supported?",
    answer:
      "All major credit and debit cards are processed securely through Stripe.",
  },
  {
    question: "What happens if I hit my monthly limit on Free?",
    answer:
      "Your existing sessions and CVs stay accessible. You can either wait for the next monthly reset or upgrade whenever you are in an active interview loop.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes — all paid plans include a 14-day money-back guarantee. Reach out via the contact page for a full refund.",
  },
];

export default function PricingPage() {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="border-b border-border/80 bg-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-[-0.025em] text-foreground sm:text-5xl">
              Simple, transparent plans
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Start free with core interview practice and the CV builder.
              Upgrade only when you need higher volume, recordings, or team
              features.
            </p>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <PricingCards />
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-muted/35 py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Common questions
          </h2>

          <Accordion type="single" collapsible className="mt-8">
            {FAQS.map((item, idx) => (
              <AccordionItem key={item.question} value={`faq-${idx}`}>
                <AccordionTrigger className="text-left text-base font-medium text-foreground">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* High-Contrast Closing CTA */}
      <section className="border-t border-white/10 bg-[#090b10] text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Questions about team seats or self-hosting?
              </h2>
              <p className="mt-2 text-sm text-white/70 sm:text-base">
                Reach out directly and we will help you pick the right setup for
                your workflow.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="h-11 bg-[#2563eb] px-6 text-white hover:bg-[#1d4ed8]"
              >
                <Link href="/sign-up">
                  Start free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-11 border-white/20 bg-transparent px-5 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/contact">Contact us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
