"use client";

import {
  ArrowUpRight,
  Briefcase,
  Check,
  Copy,
  Download,
  FileText,
  History,
  Loader2,
  Save,
  Trash2,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth-client";

interface CoverLetterState {
  title: string;
  recipientName: string;
  recipientTitle: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  yourName: string;
  yourEmail: string;
  yourPhone: string;
  yourAddress: string;
  tone: string;
  content: string;
}

export default function CoverLetterPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [applicationsList, setApplicationsList] = useState<
    { id: string; company: string; role: string; jobDescription: string }[]
  >([]);
  const [linkedApp, setLinkedApp] = useState<{
    id: string;
    company: string;
    role: string;
  } | null>(null);
  const [savedLetters, setSavedLetters] = useState<
    {
      id: string;
      title: string;
      content: string;
      jobTitle: string | null;
      company: string | null;
      updatedAt: string;
    }[]
  >([]);
  const [letterData, setLetterData] = useState<CoverLetterState>({
    title: "",
    recipientName: "",
    recipientTitle: "",
    companyName: "",
    jobTitle: "",
    jobDescription: "",
    yourName: "",
    yourEmail: "",
    yourPhone: "",
    yourAddress: "",
    tone: "professional",
    content: "",
  });

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/sign-in?callbackUrl=/cover-letter");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    if (!session?.user) return;
    setLetterData((prev) => ({
      ...prev,
      yourName: prev.yourName || session.user.name || "",
      yourEmail: prev.yourEmail || session.user.email || "",
    }));
  }, [session?.user]);

  // Load linked JobApplication (?applicationId=...) and saved cover letters from PostgreSQL
  useEffect(() => {
    if (!session?.user) return;
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const appId = params.get("applicationId");

    fetch("/api/applications", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!active || !Array.isArray(json?.applications)) return;
        setApplicationsList(json.applications);
      })
      .catch(() => {});

    if (appId) {
      fetch(`/api/applications/${appId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          const app = json?.application as
            | { id: string; company: string; role: string; jobDescription: string }
            | undefined;
          if (!active || !app) return;
          setLinkedApp({ id: app.id, company: app.company, role: app.role });
          setLetterData((prev) => ({
            ...prev,
            title: prev.title || `${app.role} — ${app.company}`,
            companyName: prev.companyName || app.company,
            jobTitle: prev.jobTitle || app.role,
            jobDescription: prev.jobDescription || app.jobDescription,
          }));
        })
        .catch(() => {});
    }

    fetch(
      appId
        ? `/api/cover-letter/save?applicationId=${encodeURIComponent(appId)}`
        : "/api/cover-letter/save",
      { cache: "no-store" },
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!active || !Array.isArray(json?.coverLetters)) return;
        const letters = json.coverLetters as {
          id: string;
          title: string;
          content: string;
          jobTitle: string | null;
          company: string | null;
          updatedAt: string;
        }[];
        setSavedLetters(letters);

        // Auto-hydrate the editor with the role's latest saved draft from PostgreSQL
        if (appId && letters.length > 0) {
          const latest = letters[0];
          setLetterData((prev) => ({
            ...prev,
            title: latest.title || prev.title,
            companyName: latest.company || prev.companyName,
            jobTitle: latest.jobTitle || prev.jobTitle,
            content: latest.content || prev.content,
          }));
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [session?.user]);

  const buildStarterContent = () => {
    const greeting = letterData.recipientName
      ? `Dear ${letterData.recipientName},`
      : "Dear Hiring Manager,";
    const jdContext = letterData.jobDescription.trim()
      ? `\n\nKey role requirements to address:\n${letterData.jobDescription.trim()}`
      : "";
    return `${greeting}\n\nI am writing to express my interest in the ${letterData.jobTitle} position at ${letterData.companyName}. Please write this cover letter in a ${letterData.tone} tone.${jdContext}\n\nSincerely,\n${letterData.yourName || "Candidate"}`;
  };

  const handleEnhanceLetter = async () => {
    if (!letterData.companyName.trim() || !letterData.jobTitle.trim()) {
      toast.error("Please enter both Company Name and Job Title first.");
      return;
    }

    const sourceContent = letterData.content.trim() || buildStarterContent();

    setIsEnhancing(true);
    try {
      const response = await fetch("/api/cover-letter/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: letterData.companyName.trim(),
          position: letterData.jobTitle.trim(),
          content: sourceContent,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to enhance cover letter");
      }

      const data = await response.json();
      setLetterData((prev) => ({
        ...prev,
        content: data.content || prev.content,
      }));

      toast.success("Cover letter enhanced.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to enhance cover letter. Please try again.",
      );
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSave = async () => {
    if (!letterData.content.trim()) {
      toast.error("Add or enhance your cover letter content before saving.");
      return;
    }

    setIsSaving(true);
    try {
      const defaultTitle =
        letterData.title.trim() ||
        [letterData.jobTitle, letterData.companyName]
          .filter(Boolean)
          .join(" - ") ||
        "Untitled Cover Letter";

      const response = await fetch("/api/cover-letter/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: defaultTitle,
          content: letterData.content,
          jobTitle: letterData.jobTitle.trim() || undefined,
          company: letterData.companyName.trim() || undefined,
          applicationId: linkedApp?.id,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save cover letter");
      }

      const saved = (await response.json()) as { id: string; createdAt?: string };
      setSavedLetters((prev) => [
        {
          id: saved.id,
          title: defaultTitle,
          content: letterData.content,
          jobTitle: letterData.jobTitle.trim() || null,
          company: letterData.companyName.trim() || null,
          updatedAt: saved.createdAt || new Date().toISOString(),
        },
        ...prev,
      ]);

      toast.success(
        linkedApp
          ? `Cover letter saved and linked to ${linkedApp.company}.`
          : "Cover letter saved to your account.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save cover letter.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!letterData.content.trim()) {
      toast.error("Add or enhance your cover letter content before exporting.");
      return;
    }

    setIsExporting(true);
    try {
      const safeCompany = letterData.companyName.trim() || "Company";
      const response = await fetch("/api/cover-letter/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          yourName: letterData.yourName,
          yourEmail: letterData.yourEmail,
          yourPhone: letterData.yourPhone,
          yourAddress: letterData.yourAddress,
          recipientName: letterData.recipientName,
          recipientTitle: letterData.recipientTitle,
          companyName: safeCompany,
          content: letterData.content,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CoverLetter_${safeCompany.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Cover letter PDF downloaded.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to download cover letter.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyContent = async () => {
    if (!letterData.content.trim()) return;
    try {
      await navigator.clipboard.writeText(letterData.content);
      setCopied(true);
      toast.success("Cover letter copied to clipboard.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  const handleSwitchRole = async (nextAppId: string) => {
    if (!nextAppId) {
      setLinkedApp(null);
      return;
    }
    const app = applicationsList.find((a) => a.id === nextAppId);
    if (!app) return;
    setLinkedApp({ id: app.id, company: app.company, role: app.role });
    setLetterData((prev) => ({
      ...prev,
      title: `${app.role} — ${app.company}`,
      companyName: app.company,
      jobTitle: app.role,
      jobDescription: app.jobDescription,
    }));
    try {
      const res = await fetch(
        `/api/cover-letter/save?applicationId=${encodeURIComponent(app.id)}`,
        { cache: "no-store" },
      );
      if (res.ok) {
        const json = await res.json();
        const letters = Array.isArray(json?.coverLetters)
          ? json.coverLetters
          : [];
        setSavedLetters(letters);
        if (letters.length > 0) {
          setLetterData((prev) => ({
            ...prev,
            title: letters[0].title || prev.title,
            content: letters[0].content || prev.content,
          }));
        }
      }
    } catch {
      // Non-blocking
    }
  };

  const handleDeleteLetter = async (letterId: string) => {
    setSavedLetters((prev) => prev.filter((item) => item.id !== letterId));
    const res = await fetch(
      `/api/cover-letter/save?id=${encodeURIComponent(letterId)}`,
      { method: "DELETE" },
    ).catch(() => null);
    if (res?.ok) {
      toast.success("Draft deleted.");
    }
  };

  const wordCount = letterData.content.trim()
    ? letterData.content.trim().split(/\s+/).length
    : 0;

  if (isPending || !session) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Cover Letter Studio
              </h1>
              <p className="text-sm text-muted-foreground">
                Draft, refine, save, and export tailored cover letters
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {applicationsList.length > 0 && (
              <select
                aria-label="Link to target role"
                value={linkedApp?.id ?? ""}
                onChange={(e) => void handleSwitchRole(e.target.value)}
                className="h-9 rounded-md border border-border bg-background px-2.5 text-xs text-foreground"
              >
                <option value="">Standalone letter</option>
                {applicationsList.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.company} · {app.role}
                  </option>
                ))}
              </select>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleCopyContent()}
              disabled={!letterData.content.trim()}
            >
              {copied ? (
                <Check className="mr-1.5 h-4 w-4 text-primary" />
              ) : (
                <Copy className="mr-1.5 h-4 w-4" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button
              onClick={handleEnhanceLetter}
              disabled={isEnhancing}
              size="sm"
            >
              {isEnhancing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              {isEnhancing ? "Enhancing..." : "Enhance with AI"}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              variant="outline"
              size="sm"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              variant="outline"
              size="sm"
            >
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {isExporting ? "Exporting..." : "Export PDF"}
            </Button>
          </div>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Letter Details</CardTitle>
            <CardDescription>
              Provide your contact details, target role, and draft content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="letter-title">Document Title (Optional)</Label>
              <Input
                id="letter-title"
                value={letterData.title}
                onChange={(e) =>
                  setLetterData({ ...letterData, title: e.target.value })
                }
                placeholder="e.g., Senior Frontend Engineer - Acme Corp"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="your-name">Your Name</Label>
                <Input
                  id="your-name"
                  value={letterData.yourName}
                  onChange={(e) =>
                    setLetterData({ ...letterData, yourName: e.target.value })
                  }
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="your-email">Your Email</Label>
                <Input
                  id="your-email"
                  type="email"
                  value={letterData.yourEmail}
                  onChange={(e) =>
                    setLetterData({ ...letterData, yourEmail: e.target.value })
                  }
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="your-phone">Phone (Optional)</Label>
                <Input
                  id="your-phone"
                  value={letterData.yourPhone}
                  onChange={(e) =>
                    setLetterData({ ...letterData, yourPhone: e.target.value })
                  }
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="your-address">Location (Optional)</Label>
                <Input
                  id="your-address"
                  value={letterData.yourAddress}
                  onChange={(e) =>
                    setLetterData({
                      ...letterData,
                      yourAddress: e.target.value,
                    })
                  }
                  placeholder="City, State"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={letterData.companyName}
                  onChange={(e) =>
                    setLetterData({
                      ...letterData,
                      companyName: e.target.value,
                    })
                  }
                  placeholder="Company you're applying to"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-title">Job Title</Label>
                <Input
                  id="job-title"
                  value={letterData.jobTitle}
                  onChange={(e) =>
                    setLetterData({ ...letterData, jobTitle: e.target.value })
                  }
                  placeholder="Position title"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="recipient-name">
                  Recipient Name (Optional)
                </Label>
                <Input
                  id="recipient-name"
                  value={letterData.recipientName}
                  onChange={(e) =>
                    setLetterData({
                      ...letterData,
                      recipientName: e.target.value,
                    })
                  }
                  placeholder="Hiring Manager Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipient-title">
                  Recipient Title (Optional)
                </Label>
                <Input
                  id="recipient-title"
                  value={letterData.recipientTitle}
                  onChange={(e) =>
                    setLetterData({
                      ...letterData,
                      recipientTitle: e.target.value,
                    })
                  }
                  placeholder="Engineering Manager, HR Lead, etc."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="letter-tone">Tone</Label>
              <Select
                value={letterData.tone}
                onValueChange={(value) =>
                  setLetterData({ ...letterData, tone: value })
                }
              >
                <SelectTrigger id="letter-tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="concise">Concise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-description">
                Job Description (Optional)
              </Label>
              <Textarea
                id="job-description"
                value={letterData.jobDescription}
                onChange={(e) =>
                  setLetterData({
                    ...letterData,
                    jobDescription: e.target.value,
                  })
                }
                placeholder="Paste key responsibilities or requirements to tailor the letter..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="letter-content">Cover Letter Content</Label>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {wordCount} words · ~{Math.max(1, Math.ceil(wordCount / 200))}{" "}
                  min read
                </span>
              </div>
              <Textarea
                id="letter-content"
                value={letterData.content}
                onChange={(e) =>
                  setLetterData({
                    ...letterData,
                    content: e.target.value,
                  })
                }
                placeholder="Write a rough draft or leave blank and click 'Enhance with AI' to generate a tailored draft..."
                rows={12}
              />
            </div>
          </CardContent>
        </Card>

        {/* Linked Role Banner & Saved Drafts */}
        {linkedApp && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm">
            <div className="flex items-center gap-2">
              <Briefcase className="size-4 text-primary" />
              <span className="text-foreground">
                Linked to{" "}
                <strong className="font-semibold">{linkedApp.role}</strong> at{" "}
                <strong className="font-semibold">{linkedApp.company}</strong> —
                saving stores this letter directly in your role dossier.
              </span>
            </div>
            <Link
              href="/applications"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Open role dossier
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        )}

        {savedLetters.length > 0 && (
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <History className="size-4 text-primary" />
                <CardTitle className="font-display text-lg">
                  Saved Cover Letters ({savedLetters.length})
                </CardTitle>
              </div>
              <CardDescription>
                Select any saved draft from PostgreSQL to continue editing or
                export as PDF.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2.5 sm:grid-cols-2">
              {savedLetters.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between gap-2 rounded-xl border border-border bg-background p-3 transition-colors hover:border-primary/40 hover:bg-muted/40"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setLetterData((prev) => ({
                        ...prev,
                        title: item.title,
                        companyName: item.company || prev.companyName,
                        jobTitle: item.jobTitle || prev.jobTitle,
                        content: item.content,
                      }))
                    }
                    className="flex w-full flex-col items-start gap-1 text-left"
                  >
                    <span className="w-full truncate text-sm font-semibold text-foreground">
                      {item.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {[item.jobTitle, item.company]
                        .filter(Boolean)
                        .join(" · ") || "General draft"}
                    </span>
                  </button>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
                    <span>
                      Updated {new Date(item.updatedAt).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleDeleteLetter(item.id)}
                      aria-label={`Delete ${item.title}`}
                      className="rounded p-1 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
