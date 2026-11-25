"use client";

import html2canvas from "html2canvas";
import {
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";

interface UserStatsPayload {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
  stats: {
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
  };
}

export default function ReadinessPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [data, setData] = useState<UserStatsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/sign-in?callbackUrl=/readiness");
    }
  }, [isPending, session, router]);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user/stats", { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to load practice telemetry");
      }
      const payload = (await res.json()) as UserStatsPayload;
      setData(payload);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load practice telemetry",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      void fetchStats();
    }
  }, [session, fetchStats]);

  const formattedDate = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date()),
    [],
  );

  const stats = data?.stats ?? {
    totalInterviews: 0,
    completedInterviews: 0,
    upcomingInterviews: 0,
    completionRate: 0,
    averageScore: null,
    scoredInterviews: 0,
    applicationsCount: 0,
    avgAtsScore: null,
    systemDesignCount: 0,
    scoredSystemDesigns: 0,
    avgSystemDesignScore: null,
    codeSubmissionsTotal: 0,
    codeSubmissionsPassed: 0,
    cvCount: 0,
    coverLetterCount: 0,
  };

  const totalLoggedEvidence =
    stats.completedInterviews +
    stats.systemDesignCount +
    stats.codeSubmissionsTotal;

  const markdownSummary = useMemo(() => {
    return [
      "### JobPrep Verified Practice Log",
      "",
      `- **Mock & Live Interviews:** ${stats.completedInterviews} completed${stats.averageScore !== null ? ` · avg ${stats.averageScore}/100 across ${stats.scoredInterviews} scored` : ""}`,
      `- **System Design Architectures:** ${stats.systemDesignCount} saved${stats.avgSystemDesignScore !== null ? ` · avg ${stats.avgSystemDesignScore}/100 across ${stats.scoredSystemDesigns} reviewed` : ""}`,
      `- **Code Challenges:** ${stats.codeSubmissionsPassed}/${stats.codeSubmissionsTotal} passed`,
      `- **Role Dossiers & Materials:** ${stats.applicationsCount} roles${stats.avgAtsScore !== null ? ` · avg ${stats.avgAtsScore}% ATS match` : ""} · ${stats.cvCount} CVs · ${stats.coverLetterCount} cover letters`,
      `- **Snapshot Date:** ${formattedDate}`,
      "",
      "_Anonymized telemetry exported directly from JobPrep PostgreSQL records._",
    ].join("\n");
  }, [stats, formattedDate]);

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdownSummary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setError("Could not copy to clipboard in this browser context.");
    }
  };

  const handleDownloadPng = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    setError(null);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        onclone: (clonedDoc) => {
          const root = clonedDoc.documentElement;
          root.style.setProperty("--background", "#ffffff");
          root.style.setProperty("--foreground", "#09090b");
          root.style.setProperty("--card", "#ffffff");
          root.style.setProperty("--card-foreground", "#09090b");
          root.style.setProperty("--primary", "#2563eb");
          root.style.setProperty("--primary-foreground", "#ffffff");
          root.style.setProperty("--secondary", "#f4f4f5");
          root.style.setProperty("--secondary-foreground", "#18181b");
          root.style.setProperty("--muted", "#f4f4f5");
          root.style.setProperty("--muted-foreground", "#52525b");
          root.style.setProperty("--accent", "#eff6ff");
          root.style.setProperty("--accent-foreground", "#1d4ed8");
          root.style.setProperty("--border", "#e4e4e7");
          root.style.setProperty("--ring", "#2563eb");
        },
      });

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `jobprep-evidence-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      setError("Failed to render PNG scorecard. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (isPending || !session) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6 lg:p-8">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-[360px] w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-5 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Verified Practice Evidence
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Direct, uninflated counts and averages from your PostgreSQL practice
            records — ready to share on GitHub, LinkedIn, or X.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void fetchStats()}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw
              className={`size-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyMarkdown}
            disabled={loading}
            className="gap-1.5"
          >
            {copied ? (
              <Check className="size-3.5 text-primary" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {copied ? "Copied Markdown" : "Copy Markdown"}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleDownloadPng}
            disabled={loading || downloading}
            className="gap-1.5"
          >
            {downloading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )}
            Download PNG
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Shareable Anonymized Evidence Card (Explicit Hex Colors for Crisp html2canvas Export) */}
      {loading ? (
        <Skeleton className="h-[340px] w-full rounded-2xl" />
      ) : (
        <div
          ref={cardRef}
          style={{
            backgroundColor: "#ffffff",
            borderColor: "#e4e4e7",
            color: "#09090b",
          }}
          className="overflow-hidden rounded-2xl border shadow-sm"
        >
          {/* Top Obsidian Band */}
          <div
            style={{ backgroundColor: "#09090b", color: "#ffffff" }}
            className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
          >
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  style={{
                    backgroundColor: "#18181b",
                    borderColor: "#27272a",
                    color: "#d4d4d8",
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium"
                >
                  <ShieldCheck
                    className="size-3.5"
                    style={{ color: "#3b82f6" }}
                  />
                  Verified PostgreSQL Telemetry · Anonymized
                </span>
              </div>

              <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                JobPrep Practice Dossier
              </h2>
              <p
                style={{ color: "#a1a1aa" }}
                className="max-w-xl text-sm leading-relaxed"
              >
                Every figure below is queried directly from completed
                interviews, architecture reviews, code runs, and role dossiers.
                No synthetic weights or estimates.
              </p>
            </div>

            <div
              style={{
                backgroundColor: "#18181b",
                borderColor: "#27272a",
              }}
              className="flex shrink-0 flex-col items-start rounded-2xl border px-6 py-4 sm:items-end"
            >
              <span
                style={{ color: "#a1a1aa" }}
                className="text-xs font-medium"
              >
                Completed Sessions
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span
                  style={{ color: "#3b82f6" }}
                  className="font-display text-5xl font-bold tracking-tight tabular-nums"
                >
                  {totalLoggedEvidence}
                </span>
                <span
                  style={{ color: "#71717a" }}
                  className="text-xs font-medium"
                >
                  total
                </span>
              </div>
            </div>
          </div>

          {/* Real Metrics Grid */}
          <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4 sm:p-8">
            <div
              style={{
                backgroundColor: "#fafafa",
                borderColor: "#e4e4e7",
              }}
              className="rounded-xl border p-4"
            >
              <p style={{ color: "#52525b" }} className="text-xs font-medium">
                Interview Average
              </p>
              <p
                style={{ color: "#2563eb" }}
                className="mt-2 font-display text-3xl font-bold tabular-nums"
              >
                {stats.averageScore !== null ? `${stats.averageScore}` : "—"}
                {stats.averageScore !== null && (
                  <span
                    style={{ color: "#71717a" }}
                    className="text-base font-medium"
                  >
                    /100
                  </span>
                )}
              </p>
              <p style={{ color: "#71717a" }} className="mt-1 text-xs">
                {stats.scoredInterviews > 0
                  ? `${stats.scoredInterviews} scored · ${stats.completedInterviews} completed`
                  : "Complete a scored mock loop"}
              </p>
            </div>

            <div
              style={{
                backgroundColor: "#fafafa",
                borderColor: "#e4e4e7",
              }}
              className="rounded-xl border p-4"
            >
              <p style={{ color: "#52525b" }} className="text-xs font-medium">
                System Design Avg
              </p>
              <p
                style={{ color: "#09090b" }}
                className="mt-2 font-display text-3xl font-bold tabular-nums"
              >
                {stats.avgSystemDesignScore !== null
                  ? `${stats.avgSystemDesignScore}`
                  : "—"}
                {stats.avgSystemDesignScore !== null && (
                  <span
                    style={{ color: "#71717a" }}
                    className="text-base font-medium"
                  >
                    /100
                  </span>
                )}
              </p>
              <p style={{ color: "#71717a" }} className="mt-1 text-xs">
                {stats.systemDesignCount > 0
                  ? `${stats.scoredSystemDesigns} reviewed · ${stats.systemDesignCount} saved`
                  : "No architectures saved yet"}
              </p>
            </div>

            <div
              style={{
                backgroundColor: "#fafafa",
                borderColor: "#e4e4e7",
              }}
              className="rounded-xl border p-4"
            >
              <p style={{ color: "#52525b" }} className="text-xs font-medium">
                Code Challenges
              </p>
              <p
                style={{ color: "#09090b" }}
                className="mt-2 font-display text-3xl font-bold tabular-nums"
              >
                {stats.codeSubmissionsTotal > 0
                  ? `${stats.codeSubmissionsPassed}/${stats.codeSubmissionsTotal}`
                  : "—"}
              </p>
              <p style={{ color: "#71717a" }} className="mt-1 text-xs">
                {stats.codeSubmissionsTotal > 0
                  ? "Passed / total submissions"
                  : "No code submissions yet"}
              </p>
            </div>

            <div
              style={{
                backgroundColor: "#fafafa",
                borderColor: "#e4e4e7",
              }}
              className="rounded-xl border p-4"
            >
              <p style={{ color: "#52525b" }} className="text-xs font-medium">
                Roles &amp; ATS Match
              </p>
              <p
                style={{ color: "#09090b" }}
                className="mt-2 font-display text-3xl font-bold tabular-nums"
              >
                {stats.avgAtsScore !== null
                  ? `${stats.avgAtsScore}%`
                  : stats.applicationsCount}
              </p>
              <p
                style={{ color: "#71717a" }}
                className="mt-1 inline-flex items-center gap-1 text-xs"
              >
                <Calendar className="size-3" />
                {stats.applicationsCount} roles · {stats.cvCount} CV ·{" "}
                {stats.coverLetterCount} letter
              </p>
            </div>
          </div>

          {/* Card Footer */}
          <div
            style={{
              backgroundColor: "#f8fafc",
              borderColor: "#e4e4e7",
              color: "#52525b",
            }}
            className="flex flex-wrap items-center justify-between gap-2 border-t px-6 py-3.5 text-xs sm:px-8"
          >
            <span className="inline-flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="size-3.5" style={{ color: "#2563eb" }} />
              Snapshot {formattedDate} · Personal identifiers excluded
            </span>
            <span className="font-mono text-[11px]">jobprep.app/readiness</span>
          </div>
        </div>
      )}

      {/* Markdown Preview & Next Actions */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="shadow-none lg:col-span-7">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="font-display text-lg">
                Markdown Summary
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                GitHub / LinkedIn / X
              </Badge>
            </div>
            <CardDescription>
              Paste directly into a README, portfolio, or progress log.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-xl border border-border bg-muted/40 p-4 font-mono text-xs leading-relaxed text-foreground">
              {markdownSummary}
            </pre>
          </CardContent>
        </Card>

        <Card className="shadow-none lg:col-span-5">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg">
              Build More Evidence
            </CardTitle>
            <CardDescription>
              Every completed session updates this card directly from
              PostgreSQL.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-between">
              <Link href="/mock-interview">
                <span className="inline-flex items-center gap-2">
                  <Target className="size-4" />
                  Run a scored mock interview
                </span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-between"
            >
              <Link href="/system-design">
                <span>Critique a system architecture</span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-between"
            >
              <Link href="/applications">
                <span>Open your role dossiers</span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
