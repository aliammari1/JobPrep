import Link from "next/link";
import prisma from "@/lib/prisma";
import { FeatureCard } from "@/components/landing/feature-card";
import { WorkflowStep } from "@/components/landing/workflow-step";
import { Testimonial } from "@/components/landing/testimonial";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BrainCircuit,
  CalendarCheck,
  MonitorPlay,
  Bot,
  Gauge,
  Code2,
  BarChart3,
  Award,
  ShieldCheck,
  Sparkles,
  LineChart,
  FolderKanban,
  VideoIcon,
} from "lucide-react";

export const revalidate = 60; // periodically refresh social proof

export default async function Home() {
  let recentUsers: { id: string; name: string | null }[] = [];
  try {
    recentUsers = await prisma.user.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true },
    });
  } catch {
    // swallow error; landing should not break if DB unavailable
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative pt-20 pb-24 px-4 sm:px-8 md:px-12 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent" />
        <div className="max-w-5xl mx-auto text-center">
          <Badge variant="outline" className="mb-6 backdrop-blur-sm">
            Empower Every Interview
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-b from-foreground to-muted-foreground/70 bg-clip-text text-transparent">
            AI-Powered Interview Preparation Platform
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Practice, simulate, analyze and continuously improve your interviewing performance with adaptive AI coaching, real-time feedback, and actionable analytics.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/sign-up">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard">View Dashboard</Link>
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
            {recentUsers.length > 0 ? (
              recentUsers.map((u) => (
                <span
                  key={u.id}
                  className="px-3 py-1 rounded-full bg-muted/60 border text-muted-foreground"
                >
                  {u.name || "New User"}
                </span>
              ))
            ) : (
              <span className="px-3 py-1 rounded-full bg-muted/60 border">Join early adopters</span>
            )}
          </div>
        </div>
      </section>

      {/* Core Feature Grid */}
      <section className="px-4 sm:px-8 md:px-12 pb-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2">
              <Sparkles className="size-6 text-primary" /> Platform Highlights
            </h2>
            <Link href="#workflow" className="text-sm text-primary font-medium hover:underline">
              See How It Works ↓
            </Link>
          </div>
          <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              title="Adaptive Prep Coach"
              description="Personalized guidance driven by your skill gaps and goals. Generates dynamic practice plans that evolve as you progress."
              href="/interview-coach"
              icon={<BrainCircuit className="size-6" />}
              badge="AI"
            />
            <FeatureCard
              title="Schedule & Organize"
              description="Coordinate upcoming interviews and practice sessions with integrated calendar workflows and reminders."
              href="/schedule-interview"
              icon={<CalendarCheck className="size-6" />}
              badge="New"
            />
            <FeatureCard
              title="Interactive Interview Room"
              description="Simulate real interview environments: video, screen sharing, live scoring and AI cues to keep you sharp."
              href="/interview-room"
              icon={<MonitorPlay className="size-6" />}
            />
            <FeatureCard
              title="Mock & Practice Modes"
              description="Target specific topics or run full scenario simulations with instant AI-generated feedback and scoring."
              href="/mock-interview"
              icon={<Gauge className="size-6" />}
            />
            <FeatureCard
              title="AI Question Builder"
              description="Generate structured, difficulty-balanced interview question sets aligned to role and seniority."
              href="/question-builder"
              icon={<Bot className="size-6" />}
              badge="AI"
            />
            <FeatureCard
              title="Skill & Performance Analytics"
              description="Granular breakdown of strengths, trends, pacing, sentiment and improvement opportunities across sessions."
              href="/performance-analytics"
              icon={<BarChart3 className="size-6" />}
              badge="Insights"
            />
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="px-4 sm:px-8 md:px-12 py-20 bg-muted/40 border-y">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">Your Continuous Improvement Loop</h2>
          <p className="text-muted-foreground max-w-2xl mb-10">
            A simple, repeatable system that compounds your interview readiness and elevates your confidence.
          </p>
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
            <WorkflowStep
              number={1}
              title="Assess"
              description="Run an initial skill & behavioral baseline to identify gaps."
              icon={<Award className="size-5" />}
            />
            <WorkflowStep
              number={2}
              title="Plan"
              description="Get an adaptive roadmap tailored to role, level and timeline."
              icon={<FolderKanban className="size-5" />}
            />
            <WorkflowStep
              number={3}
              title="Practice"
              description="Drill targeted questions and scenarios, refine delivery."
              icon={<Code2 className="size-5" />}
            />
            <WorkflowStep
              number={4}
              title="Simulate"
              description="Run full mock interviews with realistic time & environment."
              icon={<VideoIcon className="size-5" />}
            />
            <WorkflowStep
              number={5}
              title="Analyze & Iterate"
              description="Review AI insights & dashboards. Adjust plan. Repeat."
              icon={<LineChart className="size-5" />}
            />
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="px-4 sm:px-8 md:px-12 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Trusted by ambitious candidates</h2>
            <Badge variant="secondary" className="hidden sm:inline-flex">Early Access</Badge>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Testimonial quote="The adaptive feedback loop helped me prioritize the exact skills that moved the needle." name="Aisha" position="Senior Frontend Engineer" initials="AI" />
            <Testimonial quote="Felt like having a personal interview coach on demand. The analytics are gold." name="Carlos" position="Product Manager" initials="CA" />
            <Testimonial quote="My confidence skyrocketed after a week of structured mock sessions and performance reviews." name="Mei" position="Data Scientist" initials="ME" />
          </div>
        </div>
      </section>

      {/* Security / Trust */}
      <section className="px-4 sm:px-8 md:px-12 py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h3 className="text-xl md:text-2xl font-semibold tracking-tight mb-4 flex items-center gap-2">
              <ShieldCheck className="size-6 text-primary" /> Privacy & Reliability
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              We prioritize confidentiality and data minimization. Your practice sessions and analytics are encrypted at rest and never shared with third parties.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2"><Sparkles className="size-4 mt-0.5 text-primary" /> Role-based access controls</li>
              <li className="flex items-start gap-2"><Sparkles className="size-4 mt-0.5 text-primary" /> Option to purge history at any time</li>
              <li className="flex items-start gap-2"><Sparkles className="size-4 mt-0.5 text-primary" /> Continuous model quality audits</li>
            </ul>
          </div>
          <div className="relative rounded-xl border bg-background p-8 shadow-sm">
            <h4 className="font-medium mb-3">Early Access Metrics</h4>
            <Separator className="mb-4" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Mock Sessions Run</span>
                <span className="text-lg font-semibold">2,400+</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Practice Questions</span>
                <span className="text-lg font-semibold">18k+</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Avg Improvement</span>
                <span className="text-lg font-semibold">29%</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Active Candidates</span>
                <span className="text-lg font-semibold">1,100+</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Metrics reflect anonymized aggregate early-access usage.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 sm:px-8 md:px-12 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Ready to level up your interview game?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Start practicing in minutes. No credit card required to explore core features. Upgrade when you are ready for deeper analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/sign-up">Create Free Account</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/performance-analytics">View Sample Analytics</Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">Have a team? <Link href="/organizations" className="text-primary hover:underline">Request workspace access</Link>.</p>
        </div>
      </section>
    </div>
  );
}