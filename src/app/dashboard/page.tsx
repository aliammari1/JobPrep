"use client";

import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  Code2,
  FileEdit,
  FileText,
  Mail,
  MonitorPlay,
  Play,
  Plus,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/auth-client";

interface ArtifactCounts {
  cvs: number;
  coverLetters: number;
  mockSessions: number;
  interviews: number;
  systemDesignSessions: number;
  codeSubmissions: number;
}

interface StatsMetrics {
  totalInterviews: number;
  completedInterviews: number;
  upcomingInterviews: number;
  completionRate: number;
  averageScore: number | null;
  scoredInterviews: number;
  applicationsCount: number;
  avgAtsScore: number | null;
  systemDesignCount: number;
  scoredSystemDesigns: number;
  avgSystemDesignScore: number | null;
  codeSubmissionsTotal: number;
  codeSubmissionsPassed: number;
  cvCount: number;
  coverLetterCount: number;
}

interface ActiveApplicationItem {
  id: string;
  company: string;
  role: string;
  location: string;
  stage: string;
  atsScore: number | null;
  hasJobDescription: boolean;
  counts: ArtifactCounts;
  updatedAt: string;
}

interface ActivityItem {
  id: string;
  kind: "mock" | "interview" | "system-design" | "code";
  title: string;
  status: string;
  score: number | null;
  href: string;
  createdAt: string;
}

interface UserStatsResponse {
  stats: StatsMetrics;
  recentActivity: ActivityItem[];
  activeApplications: ActiveApplicationItem[];
}

const SECONDARY_TOOLS = [
  {
    title: "Code Challenge",
    description: "Timed algorithms with test cases",
    href: "/code-challenge",
    icon: Code2,
  },
  {
    title: "System Design Studio",
    description: "Whiteboard & architecture critique",
    href: "/system-design",
    icon: MonitorPlay,
  },
  {
    title: "Interview Room",
    description: "Live video & collaborative notes",
    href: "/interview-room",
    icon: MonitorPlay,
  },
  {
    title: "Question Bank",
    description: "Role-calibrated prompt sets",
    href: "/mock-interview/questions",
    icon: BookOpen,
  },
  {
    title: "Cover Letter Studio",
    description: "Role-linked cover letter drafts",
    href: "/cover-letter",
    icon: Mail,
  },
  {
    title: "Evidence Scorecard",
    description: "Shareable verified telemetry",
    href: "/readiness",
    icon: TrendingUp,
  },
];

const chartConfig = {
  sessions: {
    label: "Activities",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getNextRoleAction(app: ActiveApplicationItem): {
  label: string;
  href: string;
} {
  if (app.counts.cvs === 0) {
    return {
      label: "Tailor CV",
      href: `/cv-builder?applicationId=${app.id}`,
    };
  }
  if (app.counts.mockSessions === 0) {
    return {
      label: "Run mock interview",
      href: `/mock-interview?applicationId=${app.id}&role=${encodeURIComponent(app.role)}&company=${encodeURIComponent(app.company)}`,
    };
  }
  if (app.counts.systemDesignSessions === 0) {
    return {
      label: "Sketch system design",
      href: `/system-design?applicationId=${app.id}`,
    };
  }
  if (app.counts.coverLetters === 0) {
    return {
      label: "Draft cover letter",
      href: `/cover-letter?applicationId=${app.id}`,
    };
  }
  return {
    label: "Open dossier",
    href: "/applications",
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [data, setData] = useState<UserStatsResponse | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [activityFilter, setActivityFilter] = useState<
    "all" | "mock" | "system-design" | "code"
  >("all");

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    let active = true;
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/user/stats", { cache: "no-store" });
        if (response.ok && active) {
          const json = (await response.json()) as UserStatsResponse;
          setData(json);
        }
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        if (active) setLoadingStats(false);
      }
    };

    if (session) {
      void fetchStats();
    }
    return () => {
      active = false;
    };
  }, [session]);

  const recentActivity = data?.recentActivity ?? [];
  const activeApplications = data?.activeApplications ?? [];
  const metrics = data?.stats;

  // Real 6-week activity cadence from actual PostgreSQL timestamps across all studios
  const activitySeries = useMemo(() => {
    const now = new Date();
    const buckets: {
      label: string;
      sessions: number;
      start: number;
      end: number;
    }[] = [];
    for (let i = 5; i >= 0; i--) {
      const end = new Date(now);
      end.setDate(now.getDate() - i * 7);
      const start = new Date(end);
      start.setDate(end.getDate() - 7);
      buckets.push({
        label: end.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        sessions: 0,
        start: start.getTime(),
        end: end.getTime(),
      });
    }
    for (const item of recentActivity) {
      const ts = new Date(item.createdAt).getTime();
      const bucket = buckets.find((b) => ts >= b.start && ts <= b.end);
      if (bucket) bucket.sessions += 1;
    }
    return buckets.map(({ label, sessions }) => ({ label, sessions }));
  }, [recentActivity]);

  const filteredActivity = useMemo(() => {
    if (activityFilter === "all") return recentActivity;
    return recentActivity.filter((item) => item.kind === activityFilter);
  }, [recentActivity, activityFilter]);

  if (isPending) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
        <Skeleton className="h-36 w-full rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-12">
          <Skeleton className="h-96 rounded-2xl lg:col-span-8" />
          <Skeleton className="h-96 rounded-2xl lg:col-span-4" />
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const firstName = session.user.name?.split(" ")[0] || "there";

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-6 lg:p-8">
      {/* Focused Command Header — Obsidian + Cobalt + White */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-[oklch(0.115_0.012_258)] px-6 py-7 text-white sm:px-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/25 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-2">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {getGreeting()}, {firstName}
            </h1>
            <p className="text-sm leading-relaxed text-white/75">
              {activeApplications.length > 0
                ? `You are tracking ${metrics?.applicationsCount ?? activeApplications.length} active role${(metrics?.applicationsCount ?? 0) === 1 ? "" : "s"}. Pick up where you left off below.`
                : "Add a target role to connect your CV, cover letter, mock interviews, and system design prep in one place."}
            </p>
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <Button asChild size="sm" className="h-9 px-4">
                <Link href="/applications">
                  <Briefcase className="size-3.5" />
                  {activeApplications.length > 0
                    ? "Open role dossiers"
                    : "Add target role"}
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="h-9 border-white/20 bg-white/5 px-4 text-white hover:bg-white/12 hover:text-white"
              >
                <Link href="/mock-interview">
                  <Play className="size-3.5" />
                  Mock interview
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="h-9 px-3 text-white/80 hover:bg-white/10 hover:text-white"
              >
                <Link href="/cv-builder">
                  CV Builder
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Live PostgreSQL Telemetry Strip (Zero Fake Numbers) */}
          <div className="grid grid-cols-3 gap-3 rounded-xl border border-white/12 bg-white/[0.04] p-4 backdrop-blur-xs">
            <div>
              <p className="text-[11px] text-white/60">Interviews</p>
              <p className="mt-1 font-display text-2xl font-semibold text-white tabular-nums">
                {loadingStats ? "—" : (metrics?.totalInterviews ?? 0)}
              </p>
              <p className="text-[11px] text-white/55 tabular-nums">
                {metrics?.averageScore != null
                  ? `Avg ${metrics.averageScore}/100`
                  : "Not scored yet"}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-white/60">System Design</p>
              <p className="mt-1 font-display text-2xl font-semibold text-white tabular-nums">
                {loadingStats ? "—" : (metrics?.systemDesignCount ?? 0)}
              </p>
              <p className="text-[11px] text-white/55 tabular-nums">
                {metrics?.avgSystemDesignScore != null
                  ? `Avg ${metrics.avgSystemDesignScore}/100`
                  : "No critiques yet"}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-white/60">Artifacts</p>
              <p className="mt-1 font-display text-2xl font-semibold text-[#60a5fa] tabular-nums">
                {loadingStats
                  ? "—"
                  : (metrics?.cvCount ?? 0) + (metrics?.coverLetterCount ?? 0)}
              </p>
              <p className="text-[11px] text-white/55 tabular-nums">
                {metrics?.cvCount ?? 0} CV · {metrics?.coverLetterCount ?? 0}{" "}
                letter
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main 12-Column Operational Layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left 8 Columns: Active Role Loops + Unified Practice Log */}
        <div className="space-y-6 lg:col-span-8">
          {/* Active Hiring Loops — Every card knows its real Prisma artifact state */}
          <Card className="shadow-none">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="font-display text-lg">
                  Active hiring loops
                </CardTitle>
                <CardDescription>
                  Each role tracks your real CVs, cover letters, mock
                  interviews, and system designs in PostgreSQL.
                </CardDescription>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
              >
                <Link href="/applications">
                  <Plus className="size-3.5" />
                  Manage roles
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="space-y-3">
                  <Skeleton className="h-24 rounded-xl" />
                  <Skeleton className="h-24 rounded-xl" />
                </div>
              ) : activeApplications.length > 0 ? (
                <div className="space-y-3">
                  {activeApplications.map((app) => {
                    const nextStep = getNextRoleAction(app);
                    const artifacts = [
                      {
                        label: "CV",
                        count: app.counts.cvs,
                        href: `/cv-builder?applicationId=${app.id}`,
                      },
                      {
                        label: "Letter",
                        count: app.counts.coverLetters,
                        href: `/cover-letter?applicationId=${app.id}`,
                      },
                      {
                        label: "Mock",
                        count: app.counts.mockSessions,
                        href: `/mock-interview?applicationId=${app.id}&role=${encodeURIComponent(app.role)}&company=${encodeURIComponent(app.company)}`,
                      },
                      {
                        label: "Design",
                        count: app.counts.systemDesignSessions,
                        href: `/system-design?applicationId=${app.id}`,
                      },
                    ];

                    return (
                      <div
                        key={app.id}
                        className="role-card-container rounded-xl border border-border/80 bg-card p-4 transition-colors hover:border-primary/40"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 items-center gap-3.5">
                            {typeof app.atsScore === "number" ? (
                              <ProgressRing
                                value={app.atsScore}
                                size={44}
                                thickness={4}
                                label={`ATS coverage ${app.atsScore}%`}
                                displayValue={`${app.atsScore}%`}
                              />
                            ) : (
                              <div className="grid size-11 shrink-0 place-items-center rounded-full border border-dashed border-border text-xs font-medium text-muted-foreground">
                                —
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <Link
                                  href="/applications"
                                  className="truncate font-display text-sm font-semibold text-foreground hover:text-primary"
                                >
                                  {app.role}
                                </Link>
                                <Badge
                                  variant="secondary"
                                  className="text-[11px] capitalize"
                                >
                                  {app.stage}
                                </Badge>
                              </div>
                              <p className="truncate text-xs text-muted-foreground">
                                {app.company}
                                {app.location ? ` · ${app.location}` : ""}
                              </p>

                              {/* Real Linked Artifact Pills */}
                              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                {artifacts.map((art) => (
                                  <Link
                                    key={art.label}
                                    href={art.href}
                                    className={
                                      art.count > 0
                                        ? "inline-flex items-center gap-1 rounded-md border border-primary/25 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                                        : "inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
                                    }
                                  >
                                    {art.count > 0 && (
                                      <CheckCircle2 className="size-3" />
                                    )}
                                    {art.label}
                                    {art.count > 0 ? ` (${art.count})` : ""}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>

                          <Button
                            asChild
                            size="sm"
                            className="shrink-0 gap-1.5 self-start sm:self-center"
                          >
                            <Link href={nextStep.href}>
                              {nextStep.label}
                              <ArrowRight className="size-3.5" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-10 text-center">
                  <Briefcase className="size-6 text-primary" />
                  <p className="mt-3 font-display text-base font-semibold text-foreground">
                    No target roles tracked yet
                  </p>
                  <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
                    Create your first role dossier to unlock ATS keyword
                    coverage and one-click tailored preparation across every
                    studio.
                  </p>
                  <Button asChild size="sm" className="mt-4 gap-1.5">
                    <Link href="/applications">
                      <Plus className="size-3.5" />
                      Create role dossier
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Unified Real Practice Log */}
          <Card className="shadow-none">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="font-display text-lg">
                  Recent activity
                </CardTitle>
                <CardDescription>
                  Verified sessions saved across Mock Interviews, System Design,
                  and Code Challenges
                </CardDescription>
              </div>
              <Tabs
                value={activityFilter}
                onValueChange={(v) =>
                  setActivityFilter(
                    v as "all" | "mock" | "system-design" | "code",
                  )
                }
              >
                <TabsList className="h-8">
                  <TabsTrigger value="all" className="px-2.5 text-xs">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="mock" className="px-2.5 text-xs">
                    Mock
                  </TabsTrigger>
                  <TabsTrigger value="system-design" className="px-2.5 text-xs">
                    Design
                  </TabsTrigger>
                  <TabsTrigger value="code" className="px-2.5 text-xs">
                    Code
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {filteredActivity.length > 0 ? (
                <div className="divide-y divide-border/70">
                  {filteredActivity.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="group flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          {new Date(item.createdAt).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}{" "}
                          · <span className="capitalize">{item.status}</span>
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {item.score !== null && (
                          <Badge
                            variant="outline"
                            className="border-primary/30 bg-primary/10 text-xs text-primary tabular-nums"
                          >
                            {item.score}/100
                          </Badge>
                        )}
                        <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                  <p className="text-sm font-medium text-foreground">
                    No recorded sessions in this category yet
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Completed mock interviews, system design critiques, and code
                    submissions appear here automatically.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 4 Columns: 6-Week Real Cadence + Progressive Disclosure Tools */}
        <div className="space-y-6 lg:col-span-4">
          {/* Practice Cadence */}
          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-lg">
                  6-week cadence
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="text-xs font-medium tabular-nums"
                >
                  {recentActivity.length} logged
                </Badge>
              </div>
              <CardDescription>
                Real database sessions per week across all studios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[170px] w-full">
                <AreaChart
                  data={activitySeries}
                  margin={{ left: -20, right: 6, top: 8, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="sessionsFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-sessions)"
                        stopOpacity={0.28}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-sessions)"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={11}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={6}
                    fontSize={11}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Area
                    type="monotone"
                    dataKey="sessions"
                    stroke="var(--color-sessions)"
                    strokeWidth={2}
                    fill="url(#sessionsFill)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Direct Studio Shortcuts (Compact Primary + Native <details> Progressive Disclosure) */}
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg">
                Prep studios
              </CardTitle>
              <CardDescription>
                Jump directly into a standalone workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                asChild
                variant="outline"
                className="w-full justify-between"
              >
                <Link href="/mock-interview">
                  <span className="inline-flex items-center gap-2">
                    <Target className="size-4 text-primary" />
                    Mock Interview
                  </span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-between"
              >
                <Link href="/cv-builder">
                  <span className="inline-flex items-center gap-2">
                    <FileEdit className="size-4 text-primary" />
                    CV Builder &amp; ATS
                  </span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-between"
              >
                <Link href="/system-design">
                  <span className="inline-flex items-center gap-2">
                    <MonitorPlay className="size-4 text-primary" />
                    System Design Studio
                  </span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>

              <details className="group pt-2">
                <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground">
                  <span>More workspaces ({SECONDARY_TOOLS.length})</span>
                  <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-2 divide-y divide-border/60 rounded-xl border border-border/80 px-2">
                  {SECONDARY_TOOLS.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className="flex items-center justify-between gap-2 py-2.5 text-xs transition-colors hover:text-primary"
                    >
                      <span className="inline-flex items-center gap-2 font-medium text-foreground">
                        <tool.icon className="size-3.5 text-primary" />
                        {tool.title}
                      </span>
                      <ArrowUpRight className="size-3.5 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </details>
            </CardContent>
          </Card>

          {/* Evidence Scorecard Teaser */}
          <Card className="shadow-none">
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-display text-sm font-semibold text-foreground">
                  Evidence scorecard
                </p>
                <p className="text-xs text-muted-foreground">
                  Export verified practice telemetry as PNG or Markdown.
                </p>
              </div>
              <Button asChild size="sm" variant="outline" className="shrink-0">
                <Link href="/readiness">
                  <FileText className="size-3.5" />
                  Open
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
