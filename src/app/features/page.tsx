"use client";

import {
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  Code2,
  FileEdit,
  FileText,
  Gauge,
  Globe,
  Headphones,
  MessageSquare,
  Mic,
  Monitor,
  Play,
  Shield,
  Target,
  Users,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const featureCategories = [
  { id: "practice", label: "AI Practice", icon: Target },
  { id: "formats", label: "Interview Formats", icon: Video },
  { id: "documents", label: "Career Studio", icon: FileEdit },
  { id: "workflow", label: "Planning & Review", icon: Calendar },
];

const features = {
  practice: [
    {
      title: "Mock Interview Simulator",
      description:
        "Rehearse behavioral, technical, and leadership interviews with structured follow-up questions calibrated to your target role.",
      icon: Gauge,
      href: "/mock-interview",
      benefits: [
        "Role- and seniority-specific question sets",
        "Voice or text response capture",
        "Structured rubric scoring per answer",
        "Actionable improvement notes after each turn",
      ],
    },
    {
      title: "AI Question Bank",
      description:
        "Generate focused question sets directly from a job description or competency area so every drill targets real gaps.",
      icon: BookOpen,
      href: "/mock-interview/questions",
      benefits: [
        "Technical and behavioral tracks",
        "Ideal answer outlines and key points",
        "Difficulty calibration by level",
        "Reusable saved templates",
      ],
    },
    {
      title: "Smart Feedback Engine",
      description:
        "Inspect every response across clarity, structure, technical accuracy, and pacing — without vague generic praise.",
      icon: MessageSquare,
      href: "/mock-interview",
      benefits: [
        "Key points covered vs. missed",
        "STAR narrative pacing cues",
        "Concrete phrasing suggestions",
        "Session-over-session comparison",
      ],
    },
    {
      title: "BYOK & Local Models",
      description:
        "Connect your own Anthropic, OpenAI, or Gemini key, or point JobPrep at a local Ollama model for completely offline prep.",
      icon: Shield,
      href: "/dashboard",
      benefits: [
        "Zero vendor lock-in",
        "Full offline support via Ollama",
        "Transparent provider selection",
        "Export or purge session history anytime",
      ],
    },
  ],
  formats: [
    {
      title: "Interactive Interview Room",
      description:
        "Simulate real remote panels with video, screen sharing, collaborative whiteboard, and live session controls.",
      icon: Video,
      href: "/interview-room",
      benefits: [
        "Real-time audio & video rooms",
        "Screen sharing and whiteboard",
        "Multi-participant support",
        "In-session evaluation notes",
      ],
    },
    {
      title: "Code Challenge Arena",
      description:
        "Practice timed algorithmic and practical coding problems in a clean editor with syntax highlighting and test output.",
      icon: Code2,
      href: "/code-challenge",
      benefits: [
        "JavaScript, Python, Java, and C++ support",
        "Instant test case verification",
        "Clean split-pane problem & editor layout",
        "Time-boxed practice mode",
      ],
    },
    {
      title: "Voice & Spoken Rehearsal",
      description:
        "Practice answering out loud to sharpen cadence, eliminate filler habits, and build calm delivery under time pressure.",
      icon: Mic,
      href: "/mock-interview",
      benefits: [
        "Speech-to-text transcription",
        "Spoken clarity and structure review",
        "Hands-free phone-screen rehearsal",
        "Review transcripts alongside scores",
      ],
    },
    {
      title: "Timed Loop Simulation",
      description:
        "Run end-to-end interview loops with realistic time constraints so the actual interview feels familiar.",
      icon: Monitor,
      href: "/mock-interview",
      benefits: [
        "Per-question countdown timers",
        "Randomized follow-up probes",
        "Full-session summary report",
        "Saved history for later review",
      ],
    },
  ],
  documents: [
    {
      title: "CV & Resume Builder",
      description:
        "Compose crisp, ATS-readable resumes with live preview, reorderable sections, and one-click PDF export.",
      icon: FileEdit,
      href: "/cv-builder",
      benefits: [
        "Multiple clean editorial templates",
        "Real-time visual preview",
        "Import existing resumes (PDF / DOCX)",
        "AI-assisted bullet refinement",
      ],
    },
    {
      title: "Cover Letter Generator",
      description:
        "Draft grounded, role-specific cover letters tied directly to your actual experience and the target job description.",
      icon: FileText,
      href: "/cover-letter",
      benefits: [
        "Tailored to specific job postings",
        "Tone and length controls",
        "Clean copy & export workflow",
        "No fabricated claims",
      ],
    },
  ],
  workflow: [
    {
      title: "Interview Scheduler",
      description:
        "Organize upcoming mock sessions and real company loops with calendar exports and prep reminders.",
      icon: Calendar,
      href: "/interview-scheduler",
      benefits: [
        "Calendar sync and iCal export",
        "Structured pre-interview checklists",
        "Clear upcoming timeline",
        "Timezone-safe scheduling",
      ],
    },
    {
      title: "Recordings & Replay",
      description:
        "Revisit past interview recordings to spot habits, refine explanations, and track tangible progress over time.",
      icon: Play,
      href: "/recordings",
      benefits: [
        "Organized session archive",
        "Quick playback and review",
        "Paired with rubric evaluations",
        "Private to your workspace",
      ],
    },
    {
      title: "Team & Peer Practice",
      description:
        "Coordinate mock interviews with peers, mentors, or hiring teams in shared rooms with structured rubrics.",
      icon: Users,
      href: "/settings/team",
      benefits: [
        "Shared workspace management",
        "Consistent evaluation criteria",
        "Role-based access controls",
        "Clean review handoff",
      ],
    },
  ],
};

const INTEGRATIONS = [
  {
    icon: Calendar,
    title: "Calendar Sync",
    description: "Google Calendar and standard iCal export for interview loops.",
  },
  {
    icon: Video,
    title: "LiveKit Rooms",
    description: "Low-latency video, audio, and screen sharing built in.",
  },
  {
    icon: Shield,
    title: "Passkeys & 2FA",
    description: "Modern Better Auth security with passkeys, TOTP, and sessions.",
  },
  {
    icon: Globe,
    title: "Multi-Provider AI",
    description: "Switch freely between Anthropic, OpenAI, Gemini, or Ollama.",
  },
  {
    icon: FileText,
    title: "PDF & Document Import",
    description: "Import existing CVs and export print-ready PDFs cleanly.",
  },
  {
    icon: Headphones,
    title: "Self-Hostable Stack",
    description: "Standard Next.js + PostgreSQL deployment with Docker Compose.",
  },
];

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = useState("practice");

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="border-b border-border/80 bg-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-[-0.025em] text-foreground sm:text-5xl">
              Practical tools for every stage of your job search
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              From daily mock drills and coding challenges to live video rooms
              and ATS-ready resumes — designed to work together without clutter.
            </p>
          </div>
        </div>
      </section>

      {/* Categorized Capabilities */}
      <section className="border-b border-border bg-muted/35 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-10 grid h-auto w-full grid-cols-2 gap-1.5 rounded-xl border border-border bg-card p-1.5 sm:grid-cols-4">
              {featureCategories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <category.icon className="size-4" />
                  <span>{category.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(features).map(([categoryId, categoryFeatures]) => (
              <TabsContent key={categoryId} value={categoryId}>
                <div className="grid gap-5 md:grid-cols-2">
                  {categoryFeatures.map((feature) => (
                    <div
                      key={feature.title}
                      className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/50 sm:p-7"
                    >
                      <div>
                        <div className="grid size-9 place-items-center rounded-lg border border-primary/15 bg-accent text-accent-foreground">
                          <feature.icon className="size-4" />
                        </div>
                        <h2 className="mt-4 font-display text-xl font-semibold tracking-tight text-foreground">
                          {feature.title}
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {feature.description}
                        </p>
                        <ul className="mt-5 space-y-2 border-t border-border pt-4">
                          {feature.benefits.map((benefit) => (
                            <li
                              key={benefit}
                              className="flex items-start gap-2 text-sm text-foreground/85"
                            >
                              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-6 pt-2">
                        <Link
                          href={feature.href}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                        >
                          Open workspace
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Architecture & Integrations */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built to fit your workflow
          </h2>
          <p className="mt-2 text-base text-muted-foreground">
            Standard protocols, modern authentication, and pluggable AI
            providers.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {INTEGRATIONS.map((item) => (
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
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-border bg-muted/25">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Start practicing in minutes
              </h2>
              <p className="mt-3 text-base text-muted-foreground">
                Create a free account to access mock interviews, coding
                challenges, and the CV Builder — no credit card required.
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
                <Link href="/pricing">View pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
