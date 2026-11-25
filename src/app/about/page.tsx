import {
  ArrowRight,
  Cpu,
  Database,
  FileCheck2,
  Lock,
  ShieldCheck,
  Target,
  Video,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About — JobPrep",
  description:
    "Why we built JobPrep: a calm, local-first interview practice and career studio grounded in structured rubrics, privacy, and honest tooling.",
};

const PRINCIPLES = [
  {
    number: "01",
    title: "Rubrics over vague praise",
    description:
      "Generic encouragement does not help in a high-stakes onsite. Every mock response is evaluated against explicit criteria — structure, technical depth, clarity, and pacing.",
  },
  {
    number: "02",
    title: "Your keys, your models",
    description:
      "Connect Anthropic, OpenAI, or Gemini with your own API keys, or run completely offline with local Ollama models. Zero vendor lock-in and zero training on your recordings.",
  },
  {
    number: "03",
    title: "Active rehearsal over passive reading",
    description:
      "Reading static question lists creates false confidence. JobPrep focuses on timed speaking, live coding, realistic interview rooms, and concrete post-session review.",
  },
  {
    number: "04",
    title: "Grounded career documents",
    description:
      "Resumes and cover letters should reflect real work without fabricated buzzwords. Our studio helps sharpen metrics and structure while keeping your voice intact.",
  },
];

const ARCHITECTURE = [
  {
    icon: Cpu,
    title: "Pluggable AI Layer",
    description:
      "Switch freely between Anthropic, OpenAI, Gemini, or local Ollama instances without changing your workflow or losing history.",
  },
  {
    icon: Database,
    title: "Self-Hostable Stack",
    description:
      "Built on standard Next.js App Router and PostgreSQL with Prisma ORM, ready to run locally via Docker Compose or on your own cloud.",
  },
  {
    icon: Video,
    title: "Real-Time Practice Rooms",
    description:
      "LiveKit-powered audio, video, screen sharing, and collaborative whiteboarding for realistic remote panel simulations.",
  },
  {
    icon: ShieldCheck,
    title: "Modern Account Security",
    description:
      "Protected with Better Auth, passkeys, two-factor authentication, role-based access control, and full data export or deletion.",
  },
];

const FOCUS_AREAS = [
  {
    icon: Target,
    label: "Interview Practice",
    detail: "Behavioral, technical, system design, and timed coding drills.",
  },
  {
    icon: FileCheck2,
    label: "Career Documents",
    detail: "ATS-readable resumes, tailored cover letters, and clean PDF export.",
  },
  {
    icon: Lock,
    label: "Privacy by Default",
    detail: "Private recordings, BYOK support, and offline local inference.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Editorial Hero */}
      <section className="border-b border-border/80 bg-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl font-bold leading-[1.06] tracking-[-0.025em] text-foreground sm:text-5xl lg:text-6xl">
              Built for calm, disciplined interview preparation.
            </h1>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Most interview prep is fragmented across spreadsheets, static
              question dumps, and noisy tools that trade clarity for hype.
              JobPrep brings mock interviews, coding drills, live rooms, and
              resume craft into one focused studio you actually control.
            </p>
          </div>

          <div className="mt-12 grid gap-4 border-t border-border pt-10 sm:grid-cols-3">
            {FOCUS_AREAS.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="grid size-9 place-items-center rounded-lg border border-primary/15 bg-accent text-accent-foreground">
                  <item.icon className="size-4" />
                </div>
                <h2 className="mt-4 font-display text-base font-semibold text-foreground">
                  {item.label}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="border-y border-border bg-muted/25 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How we think about great preparation
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Four commitments that guide every feature, rubric, and architectural
              decision in JobPrep.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {PRINCIPLES.map((principle) => (
              <div
                key={principle.number}
                className="flex flex-col gap-3 border-t border-border pt-6"
              >
                <span className="font-display text-sm font-bold text-primary tabular-nums">
                  {principle.number}
                </span>
                <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
                  {principle.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture & Craft */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-4">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Transparent engineering under the hood
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Your career history and practice recordings belong to you. We
              build on open, inspectable infrastructure so individuals and teams
              can run JobPrep with confidence — hosted or self-hosted.
            </p>
            <div className="pt-2">
              <Link
                href="/features"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                Explore all platform capabilities
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
            {ARCHITECTURE.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="grid size-9 place-items-center rounded-lg border border-primary/15 bg-accent text-accent-foreground">
                  <item.icon className="size-4" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-border bg-muted/25">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Prepare with structure, not guesswork
              </h2>
              <p className="mt-3 text-base text-muted-foreground">
                Create a free account to try mock interviews, coding challenges,
                and the CV Builder, or reach out with questions.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="h-11 px-6">
                <Link href="/sign-up">
                  Get started free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-11 px-5">
                <Link href="/contact">Contact us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
