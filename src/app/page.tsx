import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarCheck,
  Check,
  Code2,
  FileEdit,
  Gauge,
  Github,
  Minus,
  MonitorPlay,
  Star,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CopyCommand } from "@/components/landing/copy-command";
import { HeroShowcase } from "@/components/landing/hero-showcase";
import { WorkflowStep } from "@/components/landing/workflow-step";
import { Button } from "@/components/ui/button";

const GITHUB_REPO = "aliammari1/JobPrep";
const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;

export const metadata: Metadata = {
  title: "JobPrep — Open-Source AI Interview Prep & Career Studio",
  description:
    "Practice interviews with structured rubrics, timed code challenges, live rooms, and ATS-ready resumes. Bring your own AI key or run 100% offline with Ollama.",
};

async function getGitHubStars(): Promise<number | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { stargazers_count?: unknown };
    return typeof data.stargazers_count === "number"
      ? data.stargazers_count
      : null;
  } catch {
    return null;
  }
}

const WORKSPACES = [
  {
    title: "Mock Interview Simulator",
    description:
      "Voice or text rehearsals scored against explicit STAR, depth, and pacing rubrics.",
    href: "/mock-interview",
    icon: Gauge,
  },
  {
    title: "Interactive Interview Room",
    description:
      "LiveKit video panels with screen sharing, whiteboard, and session recording.",
    href: "/interview-room",
    icon: MonitorPlay,
  },
  {
    title: "Code Challenge Arena",
    description:
      "Timed coding prompts with CodeMirror editing, test cases, and complexity review.",
    href: "/code-challenge",
    icon: Code2,
  },
  {
    title: "AI Question Bank",
    description:
      "Role- and seniority-calibrated question sets generated from any job description.",
    href: "/mock-interview/questions",
    icon: BookOpen,
  },
  {
    title: "CV & Cover Letter Studio",
    description:
      "ATS-readable resumes and tailored cover letters with live preview, PDF, and DOCX export.",
    href: "/cv-builder",
    icon: FileEdit,
  },
  {
    title: "Interview Scheduler",
    description:
      "Coordinate mock sessions and company loops with calendar sync and reminders.",
    href: "/interview-scheduler",
    icon: CalendarCheck,
  },
];

const COMPARISON_ROWS = [
  {
    feature: "Monthly cost",
    jobprep: "$0 — self-host or BYOK",
    paid: "$96 – $149 / month",
  },
  {
    feature: "AI models",
    jobprep: "Claude, GPT, Gemini, or local Ollama",
    paid: "Single locked vendor",
  },
  {
    feature: "Offline mode",
    jobprep: "100% local inference via Ollama",
    paid: "Cloud-only",
  },
  {
    feature: "Data ownership",
    jobprep: "Your PostgreSQL — export or purge anytime",
    paid: "Stored on vendor servers",
  },
  {
    feature: "Career suite",
    jobprep: "Mocks, LiveKit rooms, Code Arena, CV (PDF & DOCX)",
    paid: "Split across 3–4 subscriptions",
  },
];

export default async function Home() {
  const starCount = await getGitHubStars();

  return (
    <div className="flex flex-col">
      {/* Airy Centered Hero */}
      <section className="mx-auto w-full max-w-6xl px-4 pt-20 pb-14 sm:px-6 sm:pt-28 sm:pb-16 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-5xl font-bold leading-[1.03] tracking-[-0.03em] text-foreground sm:text-6xl lg:text-[4.5rem]">
            Practice interviews.
            <br />
            <span className="text-primary">Walk in ready.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            The open-source interview studio with structured rubrics, timed code
            challenges, and ATS-ready resumes. Bring your own AI key or run 100%
            offline with Ollama.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="h-12 px-7 text-sm font-semibold"
            >
              <Link href="/sign-up">
                Start practicing free
                <ArrowRight className="size-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 gap-2 px-6 text-sm font-semibold"
            >
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                <Star className="size-4 text-primary" />
                <span>Star on GitHub</span>
                {starCount !== null && (
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-foreground tabular-nums">
                    {starCount.toLocaleString()}
                  </span>
                )}
              </a>
            </Button>
          </div>
        </div>

        {/* Full-Width Interactive Product Showcase */}
        <div className="mx-auto mt-14 max-w-5xl sm:mt-16">
          <HeroShowcase />
        </div>
      </section>

      {/* Distilled Workspaces Grid — Clean Hairlines, No Heavy Cards */}
      <section className="border-t border-border bg-muted/25 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="max-w-xl font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Six integrated workspaces, one calm workflow
            </h2>
            <Link
              href="/features"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              Explore all capabilities
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {WORKSPACES.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col justify-between border-t border-border pt-6 transition-colors hover:border-primary/60"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="grid size-9 place-items-center rounded-lg bg-accent text-accent-foreground">
                      <item.icon className="size-4" />
                    </span>
                    <ArrowUpRight className="size-4 text-muted-foreground/60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Clean Architectural Comparison Table */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="max-w-xl font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why teams and candidates self-host JobPrep
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            No vendor lock-in, no $149/mo subscription, and your recordings
            never leave your database.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid grid-cols-12 border-b border-border bg-muted/45 px-5 py-4 text-xs font-semibold text-muted-foreground sm:px-6">
            <div className="col-span-4">Capability</div>
            <div className="col-span-4 text-primary">JobPrep (Open Source)</div>
            <div className="col-span-4">Paid Interview SaaS</div>
          </div>

          <div className="divide-y divide-border">
            {COMPARISON_ROWS.map((row) => (
              <div
                key={row.feature}
                className="grid grid-cols-12 items-center gap-3 px-5 py-4 text-xs sm:px-6 sm:text-sm"
              >
                <div className="col-span-4 font-medium text-foreground">
                  {row.feature}
                </div>
                <div className="col-span-4 flex items-start gap-2 font-medium text-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{row.jobprep}</span>
                </div>
                <div className="col-span-4 flex items-start gap-2 text-muted-foreground">
                  <Minus className="mt-0.5 size-4 shrink-0 text-muted-foreground/50" />
                  <span>{row.paid}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Five-Step Repeatable Loop */}
      <section
        id="workflow"
        className="border-y border-border bg-muted/25 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="max-w-xl font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              A disciplined five-step loop before every onsite
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              Turn scattered notes and generic prompts into measurable progress
              across every round.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            <WorkflowStep
              number={1}
              title="Assess"
              description="Run a baseline mock session to surface concrete technical and narrative gaps."
            />
            <WorkflowStep
              number={2}
              title="Tailor"
              description="Align your CV, cover letter, and question bank to the exact role and stack."
            />
            <WorkflowStep
              number={3}
              title="Drill"
              description="Practice targeted prompts and timed coding problems until delivery feels natural."
            />
            <WorkflowStep
              number={4}
              title="Simulate"
              description="Step into a full-length interview room with realistic pacing and recording."
            />
            <WorkflowStep
              number={5}
              title="Review"
              description="Inspect rubric scores and recordings, refine weak answers, and repeat."
            />
          </div>
        </div>
      </section>

      {/* Self-Host & Open-Source Closing Section */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="space-y-4 lg:col-span-6">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Run it locally in under a minute.
            </h2>
            <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
              Built on Next.js 15, PostgreSQL, and Prisma. Clone the repo, bring
              your own AI key or local Ollama model, and keep every recording
              under your control.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                asChild
                size="lg"
                className="h-11 px-6 text-sm font-semibold"
              >
                <Link href="/sign-up">
                  Create free account
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-11 gap-2 px-5 text-sm font-semibold"
              >
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                  <Github className="size-4" />
                  <span>Star on GitHub</span>
                  {starCount !== null && (
                    <span className="rounded bg-muted px-2 py-0.5 text-xs tabular-nums">
                      {starCount.toLocaleString()}
                    </span>
                  )}
                </a>
              </Button>
            </div>
          </div>

          <div className="min-w-0 space-y-3 lg:col-span-6">
            <CopyCommand command="git clone https://github.com/aliammari1/JobPrep && cd JobPrep && docker compose up -d" />
            <p className="text-xs text-muted-foreground">
              Includes local PostgreSQL, Better Auth passkeys &amp; 2FA, and
              pluggable Anthropic / OpenAI / Gemini / Ollama providers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
