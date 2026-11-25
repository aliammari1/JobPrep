"use client";

import {
  ArrowRight,
  Briefcase,
  Calendar,
  Code2,
  MonitorPlay,
  Target,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";

interface RoleOption {
  id: string;
  company: string;
  role: string;
  stage: string;
}

interface HubStats {
  totalInterviews: number;
  systemDesignCount: number;
  codeSubmissionsTotal: number;
  upcomingInterviews: number;
}

export default function InterviewHubPage() {
  const { data: session } = useSession();
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [stats, setStats] = useState<HubStats | null>(null);

  useEffect(() => {
    if (!session?.user) return;
    let active = true;
    Promise.all([
      fetch("/api/applications", { cache: "no-store" }).then((r) =>
        r.ok ? r.json() : null,
      ),
      fetch("/api/user/stats", { cache: "no-store" }).then((r) =>
        r.ok ? r.json() : null,
      ),
    ])
      .then(([appsJson, statsJson]) => {
        if (!active) return;
        if (Array.isArray(appsJson?.applications)) {
          setRoles(appsJson.applications);
          if (appsJson.applications.length > 0) {
            setSelectedRoleId(appsJson.applications[0].id);
          }
        }
        if (statsJson?.stats) {
          setStats({
            totalInterviews: statsJson.stats.totalInterviews ?? 0,
            systemDesignCount: statsJson.stats.systemDesignCount ?? 0,
            codeSubmissionsTotal: statsJson.stats.codeSubmissionsTotal ?? 0,
            upcomingInterviews: statsJson.stats.upcomingInterviews ?? 0,
          });
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [session?.user]);

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId) ?? null,
    [roles, selectedRoleId],
  );

  const mockHref = selectedRole
    ? `/mock-interview?applicationId=${encodeURIComponent(selectedRole.id)}&role=${encodeURIComponent(selectedRole.role)}&company=${encodeURIComponent(selectedRole.company)}`
    : "/mock-interview";

  const designHref = selectedRole
    ? `/system-design?applicationId=${encodeURIComponent(selectedRole.id)}`
    : "/system-design";

  const codeHref = selectedRole
    ? `/code-challenge?applicationId=${encodeURIComponent(selectedRole.id)}`
    : "/code-challenge";

  const tracks = [
    {
      title: "AI Mock Interview",
      description:
        "Role-calibrated technical and behavioral questions with real-time speech pacing, grading, and saved transcripts.",
      href: mockHref,
      cta: selectedRole
        ? `Practice for ${selectedRole.company}`
        : "Start mock interview",
      metric: stats
        ? `${stats.totalInterviews} sessions logged`
        : "Voice & text",
      icon: Target,
      primary: true,
    },
    {
      title: "System Design Studio",
      description:
        "Interactive architecture whiteboard with AI diagram generation from your prompt and staff-level bottleneck critiques.",
      href: designHref,
      cta: selectedRole
        ? `Design for ${selectedRole.company}`
        : "Open whiteboard",
      metric: stats
        ? `${stats.systemDesignCount} architectures saved`
        : "Interactive canvas",
      icon: MonitorPlay,
      primary: false,
    },
    {
      title: "Code Challenge Arena",
      description:
        "Timed coding editor with test cases, multi-language execution, and PostgreSQL submission history.",
      href: codeHref,
      cta: "Open code arena",
      metric: stats
        ? `${stats.codeSubmissionsTotal} submissions`
        : "Multi-language",
      icon: Code2,
      primary: false,
    },
    {
      title: "Live Room & Scheduler",
      description:
        "Run peer/interviewer video rooms with LiveKit or schedule upcoming rounds with reminders.",
      href: "/interview-scheduler",
      secondaryHref: "/interview-room",
      cta: "Open scheduler",
      secondaryCta: "Join live room",
      metric: stats
        ? `${stats.upcomingInterviews} upcoming`
        : "Video & calendar",
      icon: Video,
      primary: false,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-5 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Interview Studio
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a target role to pre-load its job description, or jump
            directly into any practice round.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
            <Briefcase className="size-3.5 text-primary" />
            <select
              aria-label="Target role context"
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="bg-transparent text-xs font-medium text-foreground focus:outline-none"
            >
              <option value="">General practice (no role)</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.company} · {r.role}
                </option>
              ))}
            </select>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/applications">Manage roles</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {tracks.map((track) => {
          const Icon = track.icon;
          return (
            <Card
              key={track.title}
              className="flex flex-col justify-between shadow-none"
            >
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <Badge variant="secondary" className="text-xs tabular-nums">
                    {track.metric}
                  </Badge>
                </div>
                <div>
                  <CardTitle className="font-display text-xl">
                    {track.title}
                  </CardTitle>
                  <CardDescription className="mt-1.5 text-sm leading-relaxed">
                    {track.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-2 pt-0">
                <Button
                  asChild
                  size="sm"
                  variant={track.primary ? "default" : "outline"}
                  className="gap-1.5"
                >
                  <Link href={track.href}>
                    {track.cta}
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
                {track.secondaryHref && track.secondaryCta && (
                  <Button asChild size="sm" variant="ghost" className="gap-1.5">
                    <Link href={track.secondaryHref}>
                      <Calendar className="size-3.5" />
                      {track.secondaryCta}
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
