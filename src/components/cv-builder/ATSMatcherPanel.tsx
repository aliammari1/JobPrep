"use client";

import {
  AlertCircle,
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  Loader2,
  Target,
  Trash2,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { analyzeATSAlignment } from "@/lib/ats-matcher";
import { type CVExperience, useCVStore } from "@/store/cv-store";

const METRIC_REGEX =
  /(\d+%|\$\d+|\d+x|\d+\s?(ms|s|sec|min|k|m|b|users|requests|engineers|teams))/i;

interface BulletEntry {
  key: string;
  expId: string;
  expTitle: string;
  expCompany: string;
  field: "description" | "highlights";
  index: number;
  text: string;
  hasMetric: boolean;
}

function toStringArray(value: string[] | string | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) return [value];
  return [];
}

function extractBulletEntries(experiences: CVExperience[]): BulletEntry[] {
  const entries: BulletEntry[] = [];

  for (const exp of experiences) {
    const descList = toStringArray(exp.description);
    descList.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      entries.push({
        key: `${exp.id}-description-${index}`,
        expId: exp.id,
        expTitle: exp.title || "Untitled Role",
        expCompany: exp.company || "Company",
        field: "description",
        index,
        text: trimmed,
        hasMetric: METRIC_REGEX.test(trimmed),
      });
    });

    const highlightList = toStringArray(exp.highlights);
    highlightList.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      entries.push({
        key: `${exp.id}-highlights-${index}`,
        expId: exp.id,
        expTitle: exp.title || "Untitled Role",
        expCompany: exp.company || "Company",
        field: "highlights",
        index,
        text: trimmed,
        hasMetric: METRIC_REGEX.test(trimmed),
      });
    });
  }

  return entries;
}

export function ATSMatcherPanel() {
  const { cvData, updateExperience } = useCVStore();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const [linkedApp, setLinkedApp] = useState<{
    id: string;
    company: string;
    role: string;
  } | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [rewritingKey, setRewritingKey] = useState<string | null>(null);
  const lastSyncedScoreRef = useRef<number | null>(null);

  useEffect(() => {
    if (!applicationId) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/applications/${applicationId}`);
        if (!res.ok) return;
        const json = (await res.json()) as {
          application?: {
            id: string;
            company: string;
            role: string;
            jobDescription: string;
          };
        };
        if (active && json.application) {
          setLinkedApp({
            id: json.application.id,
            company: json.application.company,
            role: json.application.role,
          });
          if (json.application.jobDescription) {
            setJobDescription(json.application.jobDescription);
          }
        }
      } catch {
        // Ignore optional cross-link fetch errors
      }
    })();
    return () => {
      active = false;
    };
  }, [applicationId]);

  const bulletEntries = useMemo(
    () => extractBulletEntries(cvData.experience),
    [cvData.experience],
  );

  const resumeText = useMemo(() => {
    const parts: string[] = [
      cvData.personalInfo.fullName,
      cvData.personalInfo.title,
      cvData.personalInfo.summary,
      ...cvData.experience.flatMap((exp) => [
        exp.title,
        exp.company,
        ...toStringArray(exp.description),
        ...toStringArray(exp.highlights),
      ]),
      ...cvData.skills.flatMap((skill) => [skill.category, ...skill.items]),
      ...cvData.projects.flatMap((proj) => [
        proj.name,
        ...toStringArray(proj.description),
        ...(proj.technologies || []),
      ]),
      ...cvData.education.flatMap((edu) => [
        edu.degree,
        edu.institution,
        edu.description,
      ]),
      ...cvData.certifications.flatMap((cert) => [cert.name, cert.issuer]),
    ];

    return parts.filter(Boolean).join(" ");
  }, [cvData]);

  const analysis = useMemo(
    () =>
      analyzeATSAlignment(
        jobDescription,
        resumeText,
        bulletEntries.map((entry) => entry.text),
      ),
    [jobDescription, resumeText, bulletEntries],
  );

  const weakBullets = useMemo(
    () => bulletEntries.filter((entry) => !entry.hasMetric),
    [bulletEntries],
  );

  // Sync computed ATS score back to the linked JobApplication record
  useEffect(() => {
    if (!linkedApp || analysis.totalKeywords === 0) return;
    if (lastSyncedScoreRef.current === analysis.score) return;

    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/applications/${linkedApp.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ atsScore: analysis.score }),
        });
        if (res.ok) {
          lastSyncedScoreRef.current = analysis.score;
        }
      } catch {
        // Non-blocking sync
      }
    }, 600);

    return () => window.clearTimeout(timer);
  }, [linkedApp, analysis.score, analysis.totalKeywords]);

  const handleRewriteBullet = async (entry: BulletEntry) => {
    if (rewritingKey) return;
    setRewritingKey(entry.key);

    try {
      const targetSkills = [
        ...cvData.skills.flatMap((s) => s.items),
        ...analysis.missingKeywords.slice(0, 6),
      ]
        .filter(Boolean)
        .slice(0, 20);

      const response = await fetch("/api/cv/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personalInfo: {
            fullName: cvData.personalInfo.fullName || "Candidate",
          },
          summary: cvData.personalInfo.summary || "",
          experiences: [
            {
              id: entry.expId,
              description: entry.text,
            },
          ],
          skills: targetSkills,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to rewrite bullet");
      }

      const data = await response.json();
      const enhancedExp = Array.isArray(data.experiences)
        ? data.experiences.find(
            (item: { id: string; description?: string }) =>
              item.id === entry.expId,
          )
        : null;

      const rewrittenText = enhancedExp?.description?.trim();
      if (!rewrittenText || rewrittenText === entry.text) {
        toast.info("AI returned the same bullet — try adding a metric manually.");
        return;
      }

      const targetExperience = cvData.experience.find(
        (exp) => exp.id === entry.expId,
      );
      if (!targetExperience) return;

      const updatedList = [...toStringArray(targetExperience[entry.field])];
      updatedList[entry.index] = rewrittenText;

      updateExperience(entry.expId, {
        [entry.field]: updatedList,
      });

      toast.success("Bullet rewritten with stronger measurable impact.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to rewrite bullet with AI",
      );
    } finally {
      setRewritingKey(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Target className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground leading-tight">
              ATS JD Matcher
            </h2>
            <p className="text-xs text-muted-foreground">
              Instant keyword alignment and quantified-bullet audit
            </p>
          </div>
        </div>

        {jobDescription.trim() && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setJobDescription("")}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Linked Application Context Banner */}
      {linkedApp && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-xs">
          <div className="flex min-w-0 items-center gap-2">
            <Briefcase className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate text-foreground">
              Tailoring for{" "}
              <strong className="font-semibold">{linkedApp.role}</strong> at{" "}
              <strong className="font-semibold">{linkedApp.company}</strong>
            </span>
          </div>
          <Link
            href="/applications"
            className="inline-flex shrink-0 items-center gap-0.5 font-medium text-primary hover:underline"
          >
            Tracker
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Job Description Input */}
      <Card className="p-3.5 space-y-2 border-border bg-card">
        <label
          htmlFor="ats-jd-input"
          className="text-xs font-medium text-foreground block"
        >
          Target Job Description
        </label>
        <Textarea
          id="ats-jd-input"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here to compute instant ATS keyword coverage..."
          className="min-h-[120px] resize-y text-xs leading-relaxed"
        />
      </Card>

      {/* Metrics Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3.5 border-border bg-card space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            ATS Keyword Match
          </p>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-display text-2xl font-bold tabular-nums text-foreground">
              {analysis.totalKeywords > 0 ? `${analysis.score}%` : "—"}
            </span>
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {analysis.matchedKeywords.length}/{analysis.totalKeywords} terms
            </span>
          </div>
          <Progress value={analysis.score} className="h-1.5" />
        </Card>

        <Card className="p-3.5 border-border bg-card space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Quantified Impact
          </p>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-display text-2xl font-bold tabular-nums text-foreground">
              {analysis.quantifiedBullets}/{analysis.totalBullets}
            </span>
            <span className="text-[11px] text-muted-foreground">
              bullets with metrics
            </span>
          </div>
          <Progress
            value={
              analysis.totalBullets > 0
                ? Math.round(
                    (analysis.quantifiedBullets / analysis.totalBullets) * 100,
                  )
                : 0
            }
            className="h-1.5"
          />
        </Card>
      </div>

      {/* Matched vs Missing Keywords */}
      {analysis.totalKeywords > 0 ? (
        <div className="space-y-3">
          <Card className="p-3.5 border-border bg-card space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <h3 className="font-display text-sm font-semibold text-foreground">
                  Matched Keywords
                </h3>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {analysis.matchedKeywords.length}
              </span>
            </div>
            {analysis.matchedKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {analysis.matchedKeywords.map((kw) => (
                  <Badge
                    key={kw}
                    variant="outline"
                    className="border-primary/25 bg-primary/10 text-primary text-xs font-medium"
                  >
                    {kw}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No target keywords detected in your resume yet.
              </p>
            )}
          </Card>

          <Card className="p-3.5 border-border bg-card space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-foreground" />
                <h3 className="font-display text-sm font-semibold text-foreground">
                  Missing Keywords
                </h3>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {analysis.missingKeywords.length}
              </span>
            </div>
            {analysis.missingKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {analysis.missingKeywords.map((kw) => (
                  <Badge
                    key={kw}
                    variant="outline"
                    className="border-border bg-muted text-foreground text-xs font-medium"
                  >
                    {kw}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-primary font-medium">
                All extracted job description keywords are covered.
              </p>
            )}
          </Card>
        </div>
      ) : (
        <Card className="p-4 border-border bg-muted/40 text-center">
          <p className="text-xs text-muted-foreground">
            Paste a job description above to compare matched and missing ATS
            keywords against your live resume.
          </p>
        </Card>
      )}

      {/* Weak Bullets & 1-Click AI Rewrite */}
      <Card className="p-3.5 border-border bg-card space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground">
              Bullets Missing Metrics
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Add numbers, percentages, or scale to strengthen ATS and recruiter
              impact
            </p>
          </div>
          <Badge
            variant="outline"
            className="text-xs tabular-nums border-border bg-muted text-foreground"
          >
            {weakBullets.length}
          </Badge>
        </div>

        {bulletEntries.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Add experience bullets in the Editor tab to audit quantified impact.
          </p>
        ) : weakBullets.length === 0 ? (
          <p className="text-xs text-primary font-medium">
            Every experience bullet includes a quantifiable metric.
          </p>
        ) : (
          <div className="space-y-2.5">
            {weakBullets.slice(0, 5).map((entry) => {
              const isRewriting = rewritingKey === entry.key;
              return (
                <div
                  key={entry.key}
                  className="rounded-lg border border-border bg-background p-3 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-muted-foreground truncate">
                      {entry.expTitle} · {entry.expCompany}
                    </span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">
                    {entry.text}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={rewritingKey !== null}
                    onClick={() => handleRewriteBullet(entry)}
                    className="h-7 px-2.5 text-xs font-medium border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
                  >
                    {isRewriting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        Rewriting...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-3.5 w-3.5 mr-1.5" />
                        Rewrite weak bullet with AI
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
