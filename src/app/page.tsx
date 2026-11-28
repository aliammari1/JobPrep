import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarCheck,
  Code2,
  FileEdit,
  Gauge,
  Github,
  MonitorPlay,
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
  title: "JobPrep — Interview Practice and Résumé Builder",
  description:
    "Practice interviews, review feedback on your answers, and tailor your résumé. Self-host JobPrep with a cloud AI provider or local Ollama inference.",
};

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

export default function Home() {
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
            Rehearse interview answers, review feedback against a rubric, and
            tailor your résumé to the role. Use a cloud AI provider or run
            inference locally with Ollama.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="h-12 px-7 text-sm font-semibold"
            >
              <Link href="#sample">
                Try the sample
                <ArrowRight className="size-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 gap-2 px-6 text-sm font-semibold"
            >
              <Link href="/sign-up">Create an account</Link>
            </Button>
          </div>
        </div>

        <section
          id="sample"
          aria-labelledby="sample-heading"
          className="mx-auto mt-14 max-w-5xl scroll-mt-24 sm:mt-16"
        >
          <h2
            id="sample-heading"
            className="text-lg font-semibold text-foreground"
          >
            Sample interview
          </h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">
            Compare two example answers and see how the rubric works. The scores
            and feedback are illustrative.
          </p>
          <HeroShowcase />
        </section>
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

      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="space-y-4 lg:col-span-6">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Run JobPrep on your own server
            </h2>
            <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
              JobPrep is source-available. The setup guide covers PostgreSQL,
              authentication, and optional integrations. Commercial use requires
              a separate license.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                asChild
                size="lg"
                className="h-11 px-6 text-sm font-semibold"
              >
                <a
                  href={`${GITHUB_URL}/blob/main/CONTRIBUTING.md#getting-started-web-app`}
                >
                  Local setup guide
                  <ArrowRight className="size-4" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-11 gap-2 px-5 text-sm font-semibold"
              >
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                  <Github className="size-4" />
                  <span>View on GitHub</span>
                </a>
              </Button>
            </div>
          </div>

          <div className="min-w-0 space-y-3 lg:col-span-6">
            <CopyCommand command="git clone https://github.com/aliammari1/JobPrep.git" />
            <p className="text-xs text-muted-foreground">
              See the setup guide for the remaining steps.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
