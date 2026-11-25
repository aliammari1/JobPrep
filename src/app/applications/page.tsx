"use client";

import {
  ArrowRight,
  Briefcase,
  Check,
  ExternalLink,
  FileEdit,
  FileText,
  Loader2,
  MapPin,
  MonitorPlay,
  Plus,
  Search,
  Target,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { analyzeATSAlignment } from "@/lib/ats-matcher";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useCVStore } from "@/store/cv-store";

type Stage = "saved" | "applied" | "screening" | "onsite" | "offer";

interface ArtifactCounts {
  cvs: number;
  coverLetters: number;
  mockSessions: number;
  interviews: number;
  systemDesignSessions: number;
  codeSubmissions: number;
}

interface JobApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  jobUrl: string;
  salaryRange: string;
  stage: Stage;
  jobDescription: string;
  atsScore: number | null;
  notes: string;
  counts: ArtifactCounts;
  createdAt: string;
  updatedAt: string;
}

interface RoleArtifacts {
  cvs: { id: string; title: string; updatedAt: string }[];
  coverLetters: { id: string; title: string; updatedAt: string }[];
  mockSessions: {
    id: string;
    sessionType: string;
    overallScore: number | null;
    duration: number;
    createdAt: string;
  }[];
  interviews: {
    id: string;
    status: string;
    overallScore: number | null;
    scheduledAt: string | null;
    createdAt: string;
  }[];
  systemDesignSessions: {
    id: string;
    title: string;
    score: number | null;
    updatedAt: string;
  }[];
  codeSubmissions: {
    id: string;
    title: string;
    language: string;
    status: string;
    testsPassed: number | null;
    totalTests: number | null;
    createdAt: string;
  }[];
}

const STAGES: { id: Stage; label: string }[] = [
  { id: "saved", label: "Saved" },
  { id: "applied", label: "Applied" },
  { id: "screening", label: "Screening" },
  { id: "onsite", label: "Onsite" },
  { id: "offer", label: "Offer" },
];

export default function ApplicationsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const cvData = useCVStore((s) => s.cvData);

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState<Stage | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [dossierArtifacts, setDossierArtifacts] =
    useState<RoleArtifacts | null>(null);
  const [loadingDossier, setLoadingDossier] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company: "",
    role: "",
    location: "",
    salaryRange: "",
    jobUrl: "",
    jobDescription: "",
  });

  const jdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notesTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/sign-in?callbackUrl=/applications");
    }
  }, [isPending, session, router]);

  const loadApplications = useCallback(async () => {
    try {
      const res = await fetch("/api/applications", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load applications");
      const json = (await res.json()) as { applications: JobApplication[] };
      setApplications(json.applications);
      setSelectedId((prev) =>
        prev && json.applications.some((a) => a.id === prev)
          ? prev
          : (json.applications[0]?.id ?? null),
      );
    } catch {
      toast.error("Could not load your applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      void loadApplications();
    }
  }, [session, loadApplications]);

  // Fetch full relational dossier (linked CVs, Cover Letters, Mock Sessions, System Designs) for selected role
  useEffect(() => {
    if (!selectedId || !session) {
      setDossierArtifacts(null);
      return;
    }
    let active = true;
    setLoadingDossier(true);

    fetch(`/api/applications/${selectedId}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!active || !json?.application?.artifacts) return;
        setDossierArtifacts(json.application.artifacts as RoleArtifacts);
      })
      .catch(() => {
        if (active) setDossierArtifacts(null);
      })
      .finally(() => {
        if (active) setLoadingDossier(false);
      });

    return () => {
      active = false;
    };
  }, [selectedId, session]);

  const { resumeText, resumeBullets } = useMemo(() => {
    const bullets: string[] = [];
    for (const exp of cvData.experience) {
      for (const line of exp.description) {
        if (line.trim()) bullets.push(line.trim());
      }
      if (exp.highlights) {
        for (const h of exp.highlights) {
          if (h.trim()) bullets.push(h.trim());
        }
      }
    }
    const text = [
      cvData.personalInfo.fullName,
      cvData.personalInfo.title,
      cvData.personalInfo.summary,
      ...cvData.skills.flatMap((s) => [s.category, ...s.items]),
      ...cvData.experience.flatMap((e) => [e.title, e.company, ...e.description]),
      ...cvData.projects.flatMap((p) => [
        p.name,
        ...p.description,
        ...(p.technologies ?? []),
      ]),
    ]
      .filter(Boolean)
      .join(" ");

    return { resumeText: text, resumeBullets: bullets };
  }, [cvData]);

  const filteredApplications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return applications.filter((app) => {
      if (stageFilter !== "all" && app.stage !== stageFilter) return false;
      if (!q) return true;
      return (
        app.company.toLowerCase().includes(q) ||
        app.role.toLowerCase().includes(q) ||
        app.location.toLowerCase().includes(q)
      );
    });
  }, [applications, stageFilter, searchQuery]);

  const selectedApp = useMemo(
    () =>
      applications.find((a) => a.id === selectedId) ??
      filteredApplications[0] ??
      null,
    [applications, filteredApplications, selectedId],
  );

  const selectedAnalysis = useMemo(() => {
    if (!selectedApp || !selectedApp.jobDescription.trim()) return null;
    return analyzeATSAlignment(
      selectedApp.jobDescription,
      resumeText,
      resumeBullets,
    );
  }, [selectedApp, resumeText, resumeBullets]);

  const stageCounts = useMemo(() => {
    const counts: Record<Stage, number> = {
      saved: 0,
      applied: 0,
      screening: 0,
      onsite: 0,
      offer: 0,
    };
    for (const app of applications) {
      counts[app.stage] = (counts[app.stage] ?? 0) + 1;
    }
    return counts;
  }, [applications]);

  const patchApplication = useCallback(
    async (
      id: string,
      payload: Partial<
        Pick<
          JobApplication,
          "stage" | "jobDescription" | "atsScore" | "notes" | "jobUrl" | "salaryRange"
        >
      >,
    ) => {
      try {
        const res = await fetch(`/api/applications/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Update failed");
        const json = (await res.json()) as { application: JobApplication };
        setApplications((prev) =>
          prev.map((a) => (a.id === id ? json.application : a)),
        );
      } catch {
        toast.error("Could not save changes.");
      }
    },
    [],
  );

  const handleMoveStage = (id: string, nextStage: Stage) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, stage: nextStage } : a)),
    );
    void patchApplication(id, { stage: nextStage });
  };

  const handleDelete = async (id: string) => {
    const previous = applications;
    const remaining = applications.filter((a) => a.id !== id);
    setApplications(remaining);
    if (selectedId === id) {
      setSelectedId(remaining[0]?.id ?? null);
    }

    try {
      const res = await fetch(`/api/applications/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Role removed from your tracker.");
    } catch {
      setApplications(previous);
      toast.error("Could not delete role.");
    }
  };

  const handleAddApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company.trim() || !form.role.trim()) return;
    setSaving(true);
    try {
      const initialScore = form.jobDescription.trim()
        ? analyzeATSAlignment(form.jobDescription, resumeText, resumeBullets)
            .score
        : null;

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: form.company.trim(),
          role: form.role.trim(),
          location: form.location.trim(),
          salaryRange: form.salaryRange.trim(),
          jobUrl: form.jobUrl.trim(),
          jobDescription: form.jobDescription.trim(),
          atsScore: initialScore,
        }),
      });
      if (!res.ok) throw new Error("Failed to create application");
      const json = (await res.json()) as { application: JobApplication };
      setApplications((prev) => [json.application, ...prev]);
      setSelectedId(json.application.id);
      setStageFilter("all");
      setForm({
        company: "",
        role: "",
        location: "",
        salaryRange: "",
        jobUrl: "",
        jobDescription: "",
      });
      setDialogOpen(false);
      toast.success(
        `Created dossier for ${json.application.role} at ${json.application.company}.`,
      );
    } catch {
      toast.error("Could not save application.");
    } finally {
      setSaving(false);
    }
  };

  const handleJdChange = (appId: string, value: string) => {
    const computedScore = value.trim()
      ? analyzeATSAlignment(value, resumeText, resumeBullets).score
      : null;

    setApplications((prev) =>
      prev.map((a) =>
        a.id === appId
          ? { ...a, jobDescription: value, atsScore: computedScore }
          : a,
      ),
    );

    if (jdTimerRef.current) clearTimeout(jdTimerRef.current);
    jdTimerRef.current = setTimeout(() => {
      void patchApplication(appId, {
        jobDescription: value,
        atsScore: computedScore,
      });
    }, 650);
  };

  const handleNotesChange = (appId: string, value: string) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, notes: value } : a)),
    );
    if (notesTimerRef.current) clearTimeout(notesTimerRef.current);
    notesTimerRef.current = setTimeout(() => {
      void patchApplication(appId, { notes: value });
    }, 650);
  };

  if (isPending || !session || loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
        <Skeleton className="h-12 w-72" />
        <div className="grid gap-6 lg:grid-cols-12">
          <Skeleton className="h-[540px] rounded-2xl lg:col-span-4" />
          <Skeleton className="h-[540px] rounded-2xl lg:col-span-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Role Dossiers
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every target role connects your tailored CV, cover letter, mock
            interviews, and system design drafts in one place.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="size-4" />
              Add target role
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <form onSubmit={handleAddApplication} className="space-y-4">
              <DialogHeader>
                <DialogTitle className="font-display">
                  New role dossier
                </DialogTitle>
                <DialogDescription>
                  Paste the job description to compute real ATS keyword coverage
                  and pre-fill your CV, cover letter, and mock interview setups.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="app-company">Company</Label>
                  <Input
                    id="app-company"
                    required
                    placeholder="e.g. Stripe"
                    value={form.company}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, company: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="app-role">Role title</Label>
                  <Input
                    id="app-role"
                    required
                    placeholder="e.g. Senior Backend Engineer"
                    value={form.role}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, role: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="app-location">Location</Label>
                  <Input
                    id="app-location"
                    placeholder="Remote / London / NYC"
                    value={form.location}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, location: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="app-salary">Compensation (optional)</Label>
                  <Input
                    id="app-salary"
                    placeholder="e.g. $180k–$210k"
                    value={form.salaryRange}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, salaryRange: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="app-url">Job posting URL (optional)</Label>
                <Input
                  id="app-url"
                  type="url"
                  placeholder="https://..."
                  value={form.jobUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, jobUrl: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="app-jd">Job description</Label>
                <Textarea
                  id="app-jd"
                  rows={5}
                  placeholder="Paste requirements, stack, and responsibilities..."
                  value={form.jobDescription}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, jobDescription: e.target.value }))
                  }
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-1.5 size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Create dossier"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pipeline Filter Strip + Search */}
      {applications.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setStageFilter("all")}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                stageFilter === "all"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              All ({applications.length})
            </button>
            {STAGES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStageFilter(s.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors tabular-nums",
                  stageFilter === s.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {s.label} ({stageCounts[s.id]})
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter company or role..."
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>
      )}

      {/* Main Master-Detail Workspace */}
      {applications.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Briefcase className="size-6" />
            </div>
            <h2 className="mt-4 font-display text-xl font-semibold text-foreground">
              Start with one real role you want to land
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Adding a target role creates a live dossier in PostgreSQL. From
              there, your tailored CV, cover letter, mock interviews, and system
              design sketches stay linked to that exact opportunity.
            </p>
            <Button
              size="sm"
              className="mt-6 gap-1.5"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="size-4" />
              Add your first target role
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Rail: Role List */}
          <aside className="space-y-2.5 lg:col-span-4">
            {filteredApplications.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                No roles match this filter.
              </div>
            ) : (
              filteredApplications.map((app) => {
                const isSelected = selectedApp?.id === app.id;
                const liveAts = app.jobDescription.trim()
                  ? analyzeATSAlignment(
                      app.jobDescription,
                      resumeText,
                      resumeBullets,
                    ).score
                  : app.atsScore;
                const totalArtifacts =
                  app.counts.cvs +
                  app.counts.coverLetters +
                  app.counts.mockSessions +
                  app.counts.systemDesignSessions;

                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => setSelectedId(app.id)}
                    className={cn(
                      "role-card-container w-full rounded-xl border p-4 text-left transition-all",
                      isSelected
                        ? "border-primary bg-accent/40 ring-1 ring-primary/25"
                        : "border-border bg-card hover:border-foreground/30",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-sm font-semibold text-foreground">
                          {app.role}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {app.company}
                          {app.location ? ` · ${app.location}` : ""}
                        </p>
                      </div>

                      {typeof liveAts === "number" ? (
                        <ProgressRing
                          value={liveAts}
                          size={40}
                          thickness={3.5}
                          label={`ATS match ${liveAts}%`}
                          displayValue={`${liveAts}%`}
                        />
                      ) : (
                        <Badge
                          variant="secondary"
                          className="shrink-0 text-[11px] capitalize"
                        >
                          {app.stage}
                        </Badge>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5 font-medium capitalize text-foreground/80">
                        <span className="size-1.5 rounded-full bg-primary" />
                        {app.stage}
                      </span>
                      <span className="tabular-nums">
                        {totalArtifacts} linked artifact
                        {totalArtifacts === 1 ? "" : "s"}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </aside>

          {/* Right Pane: Selected Role Dossier */}
          <div className="space-y-6 lg:col-span-8">
            {selectedApp && (
              <>
                {/* Role Header + Stage Stepper */}
                <Card className="shadow-none">
                  <CardHeader className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle className="font-display text-2xl">
                            {selectedApp.role}
                          </CardTitle>
                          {selectedApp.salaryRange && (
                            <Badge variant="secondary" className="text-xs">
                              {selectedApp.salaryRange}
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="flex flex-wrap items-center gap-3 text-sm">
                          <span className="font-medium text-foreground">
                            {selectedApp.company}
                          </span>
                          {selectedApp.location && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="size-3.5" />
                              {selectedApp.location}
                            </span>
                          )}
                          {selectedApp.jobUrl && (
                            <a
                              href={selectedApp.jobUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:underline"
                            >
                              Posting
                              <ExternalLink className="size-3" />
                            </a>
                          )}
                        </CardDescription>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => void handleDelete(selectedApp.id)}
                        className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                        Remove
                      </Button>
                    </div>

                    {/* Interactive Stage Stepper */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {STAGES.map((s) => {
                        const active = selectedApp.stage === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() =>
                              handleMoveStage(selectedApp.id, s.id)
                            }
                            className={cn(
                              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                              active
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                            )}
                          >
                            {s.label}
                          </button>
                        );
                      })}
                    </div>
                  </CardHeader>
                </Card>

                {/* Interconnected Preparation Matrix (Real Prisma Relations) */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Tailored CV */}
                  <Card className="shadow-none">
                    <CardContent className="flex h-full flex-col justify-between gap-3 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                            <FileEdit className="size-4" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              Tailored CV
                            </p>
                            <p className="text-xs text-muted-foreground tabular-nums">
                              {selectedApp.counts.cvs} saved version
                              {selectedApp.counts.cvs === 1 ? "" : "s"}
                            </p>
                          </div>
                        </div>
                        {selectedAnalysis && (
                          <Badge
                            variant="outline"
                            className="border-primary/30 bg-primary/10 text-xs text-primary tabular-nums"
                          >
                            {selectedAnalysis.score}% ATS
                          </Badge>
                        )}
                      </div>

                      {!loadingDossier &&
                        dossierArtifacts &&
                        dossierArtifacts.cvs.length > 0 && (
                          <p className="truncate text-xs text-muted-foreground">
                            Latest: {dossierArtifacts.cvs[0].title}
                          </p>
                        )}

                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <Link
                          href={`/cv-builder?applicationId=${selectedApp.id}`}
                        >
                          <span>Tailor CV for this role</span>
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Cover Letter */}
                  <Card className="shadow-none">
                    <CardContent className="flex h-full flex-col justify-between gap-3 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                            <FileText className="size-4" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              Cover Letter
                            </p>
                            <p className="text-xs text-muted-foreground tabular-nums">
                              {selectedApp.counts.coverLetters} saved draft
                              {selectedApp.counts.coverLetters === 1 ? "" : "s"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {!loadingDossier &&
                        dossierArtifacts &&
                        dossierArtifacts.coverLetters.length > 0 && (
                          <p className="truncate text-xs text-muted-foreground">
                            Latest: {dossierArtifacts.coverLetters[0].title}
                          </p>
                        )}

                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <Link
                          href={`/cover-letter?applicationId=${selectedApp.id}`}
                        >
                          <span>Draft cover letter</span>
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Mock Interviews */}
                  <Card className="shadow-none">
                    <CardContent className="flex h-full flex-col justify-between gap-3 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                            <Target className="size-4" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              Mock Interviews
                            </p>
                            <p className="text-xs text-muted-foreground tabular-nums">
                              {selectedApp.counts.mockSessions} completed loop
                              {selectedApp.counts.mockSessions === 1 ? "" : "s"}
                            </p>
                          </div>
                        </div>
                        {!loadingDossier &&
                          dossierArtifacts?.mockSessions[0]?.overallScore !=
                            null && (
                            <Badge
                              variant="outline"
                              className="border-primary/30 bg-primary/10 text-xs text-primary tabular-nums"
                            >
                              {Math.round(
                                dossierArtifacts.mockSessions[0].overallScore,
                              )}
                              /100
                            </Badge>
                          )}
                      </div>

                      {!loadingDossier &&
                        dossierArtifacts &&
                        dossierArtifacts.mockSessions.length > 0 && (
                          <Link
                            href={`/saved-interviews/${dossierArtifacts.mockSessions[0].id}`}
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            Review latest transcript →
                          </Link>
                        )}

                      <Button
                        asChild
                        size="sm"
                        className="w-full justify-between"
                      >
                        <Link
                          href={`/mock-interview?applicationId=${selectedApp.id}&role=${encodeURIComponent(selectedApp.role)}&company=${encodeURIComponent(selectedApp.company)}`}
                        >
                          <span>Run role mock interview</span>
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>

                  {/* System Design */}
                  <Card className="shadow-none">
                    <CardContent className="flex h-full flex-col justify-between gap-3 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                            <MonitorPlay className="size-4" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              System Design
                            </p>
                            <p className="text-xs text-muted-foreground tabular-nums">
                              {selectedApp.counts.systemDesignSessions} saved
                              architecture
                              {selectedApp.counts.systemDesignSessions === 1
                                ? ""
                                : "s"}
                            </p>
                          </div>
                        </div>
                        {!loadingDossier &&
                          dossierArtifacts?.systemDesignSessions[0]?.score !=
                            null && (
                            <Badge
                              variant="outline"
                              className="border-primary/30 bg-primary/10 text-xs text-primary tabular-nums"
                            >
                              {dossierArtifacts.systemDesignSessions[0].score}
                              /100
                            </Badge>
                          )}
                      </div>

                      {!loadingDossier &&
                        dossierArtifacts &&
                        dossierArtifacts.systemDesignSessions.length > 0 && (
                          <p className="truncate text-xs text-muted-foreground">
                            Latest:{" "}
                            {dossierArtifacts.systemDesignSessions[0].title}
                          </p>
                        )}

                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <Link
                          href={`/system-design?applicationId=${selectedApp.id}`}
                        >
                          <span>Sketch system design</span>
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Live ATS Alignment & Editable Job Description */}
                <Card className="shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-display text-lg">
                      Job description &amp; live ATS coverage
                    </CardTitle>
                    <CardDescription>
                      Compared in real time against your active CV in CV
                      Builder.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="dossier-jd">Job description</Label>
                        <Textarea
                          id="dossier-jd"
                          rows={7}
                          placeholder="Paste the job description to extract required skills and compute real ATS keyword coverage..."
                          value={selectedApp.jobDescription}
                          onChange={(e) =>
                            handleJdChange(selectedApp.id, e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="dossier-notes">
                          Recruiter &amp; loop notes
                        </Label>
                        <Textarea
                          id="dossier-notes"
                          rows={3}
                          placeholder="Interviewer names, panel focus, follow-up questions..."
                          value={selectedApp.notes}
                          onChange={(e) =>
                            handleNotesChange(selectedApp.id, e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      {selectedAnalysis ? (
                        <>
                          <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-4">
                            <ProgressRing
                              value={selectedAnalysis.score}
                              size={56}
                              thickness={5}
                              label={`ATS keyword match ${selectedAnalysis.score}%`}
                              displayValue={`${selectedAnalysis.score}%`}
                            />
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {selectedAnalysis.matchedKeywords.length} of{" "}
                                {selectedAnalysis.totalKeywords} JD terms found
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {selectedAnalysis.quantifiedBullets} of{" "}
                                {selectedAnalysis.totalBullets} CV bullets
                                include measurable metrics
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-foreground">
                              Matched in your CV
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedAnalysis.matchedKeywords.length > 0 ? (
                                selectedAnalysis.matchedKeywords.map((kw) => (
                                  <Badge
                                    key={kw}
                                    variant="secondary"
                                    className="gap-1 text-xs"
                                  >
                                    <Check className="size-3 text-primary" />
                                    {kw}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  Add experience in CV Builder to see matched
                                  terms.
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-foreground">
                              Missing from your CV
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedAnalysis.missingKeywords.length > 0 ? (
                                selectedAnalysis.missingKeywords.map((kw) => (
                                  <Badge
                                    key={kw}
                                    variant="outline"
                                    className="gap-1 text-xs text-muted-foreground"
                                  >
                                    <X className="size-3" />
                                    {kw}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs font-medium text-primary">
                                  Every extracted JD keyword is covered.
                                </span>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-border p-6 text-center">
                          <Target className="size-5 text-primary" />
                          <p className="mt-2 text-sm font-medium text-foreground">
                            No job description pasted yet
                          </p>
                          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                            Paste the posting on the left to measure exact
                            keyword coverage against your live CV.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
