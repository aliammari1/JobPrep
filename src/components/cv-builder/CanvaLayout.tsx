"use client";

import { Download, Linkedin, MoreHorizontal, Redo2, Undo2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCVStore } from "@/store/cv-store";
import { AISuggestionPanel } from "./AISuggestionPanel";
import { ATSMatcherPanel } from "./ATSMatcherPanel";
import styles from "./cv-workspace.module.css";
import { EditorPanel } from "./EditorPanel";
import { ExportPanel } from "./ExportPanel";
import { PreviewPanel } from "./PreviewPanel";
import { SkillsGapAnalyzer } from "./SkillsGapAnalyzer";

export function CanvaLayout() {
  const [activeTab, setActiveTab] = useState("editor");
  const [showPreview, setShowPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { cvData, settings, canUndo, canRedo, undo, redo } = useCVStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [applicationsList, setApplicationsList] = useState<
    { id: string; company: string; role: string }[]
  >([]);

  useEffect(() => {
    let active = true;
    fetch("/api/applications", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (active && Array.isArray(json?.applications)) {
          setApplicationsList(json.applications);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Open ATS Matcher and hydrate saved CV from PostgreSQL when launched with ?applicationId=...
  useEffect(() => {
    const applicationId = searchParams.get("applicationId");
    if (applicationId) {
      setActiveTab("ats-matcher");
      setShowPreview(false);
    }

    let active = true;
    const url = applicationId
      ? `/api/cv/save?applicationId=${encodeURIComponent(applicationId)}`
      : "/api/cv/save";

    fetch(url, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!active || !Array.isArray(json?.cvs) || json.cvs.length === 0) {
          return;
        }
        const latest = json.cvs[0] as {
          title?: string;
          content?:
            | { cvData?: Record<string, unknown> }
            | Record<string, unknown>;
        };
        const payload =
          latest.content &&
          typeof latest.content === "object" &&
          "cvData" in latest.content &&
          latest.content.cvData
            ? latest.content.cvData
            : latest.content;

        if (payload && typeof payload === "object") {
          useCVStore
            .getState()
            .importData(
              payload as Parameters<
                ReturnType<typeof useCVStore.getState>["importData"]
              >[0],
            );
          if (applicationId && latest.title) {
            toast.success(`Loaded "${latest.title}" from PostgreSQL`);
          }
        }
      })
      .catch(() => {
        // Non-blocking DB hydration
      });

    return () => {
      active = false;
    };
  }, [searchParams]);

  // Keyboard shortcuts
  useHotkeys("mod+z", () => canUndo() && undo());
  useHotkeys("mod+shift+z", () => canRedo() && redo());
  useHotkeys("mod+s", (e) => {
    e.preventDefault();
    handleSave();
  });
  useHotkeys("mod+k", (e) => {
    e.preventDefault();
    setActiveTab("ai-suggestions");
    setShowPreview(false);
  });

  // Auto-import from LinkedIn extension via window message
  useEffect(() => {
    const importType = searchParams.get("import");
    if (importType === "linkedin") {
      const toastId = toast.loading("Waiting for LinkedIn data...");
      let timeoutId: NodeJS.Timeout | null = null;
      let isHandled = false;

      // Listen for message from extension
      const handleMessage = async (event: MessageEvent) => {
        // Security: Verify origin if needed
        if (event.data?.type !== "LINKEDIN_IMPORT_SESSION") return;

        if (isHandled) return; // Prevent duplicate processing
        isHandled = true;

        // Clear timeout immediately when message received
        if (timeoutId) clearTimeout(timeoutId);

        const sessionId = event.data?.sessionId;
        if (!sessionId) {
          toast.error("No session ID received from extension", { id: toastId });
          window.removeEventListener("message", handleMessage);
          return;
        }

        try {
          // Retrieve data via POST (secure, no PII in URLs)
          const res = await fetch("/api/cv/import-extension/retrieve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          });

          const result = await res.json();

          if (result.success && result.data) {
            useCVStore.getState().importData(result.data);
            toast.success("LinkedIn data imported successfully!", {
              id: toastId,
            });
          } else {
            toast.error(result.error || "Failed to import LinkedIn data", {
              id: toastId,
            });
          }
        } catch (error) {
          console.error("Import error:", error);
          toast.error("Failed to import LinkedIn data", { id: toastId });
        } finally {
          window.removeEventListener("message", handleMessage);
        }
      };

      window.addEventListener("message", handleMessage);

      // Request session ID from extension content script
      window.postMessage({ type: "REQUEST_LINKEDIN_SESSION" }, "*");

      // Timeout after 10 seconds
      timeoutId = setTimeout(() => {
        if (!isHandled) {
          window.removeEventListener("message", handleMessage);
          toast.error("Import timeout - no data received from extension", {
            id: toastId,
          });
        }
      }, 10000);

      return () => {
        window.removeEventListener("message", handleMessage);
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [searchParams]);
  const handleLinkedInImport = async () => {
    const username = prompt("Enter your LinkedIn username (e.g., john-doe):");
    if (!username) return;

    toast.loading("Scraping LinkedIn profile...");
    try {
      const res = await fetch("/api/cv/scrape-linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const result = await res.json();
      if (result.success) {
        useCVStore.getState().importData(result.data);
        toast.success("LinkedIn data imported successfully!");
      } else {
        toast.error(result.error || "Failed to import LinkedIn data");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to import from LinkedIn";
      toast.error(message);
    }
  };

  function normalizeCV(data: any) {
    return {
      personalInfo: {
        fullName: data.personalInfo?.fullName || "",
        title: data.personalInfo?.title || "",
        email: data.personalInfo?.email || "",
        phone: data.personalInfo?.phone || "",
        location: data.personalInfo?.location || "",
        summary: data.personalInfo?.summary || "",
        website: data.personalInfo?.website || "",
        linkedin: data.personalInfo?.linkedin || "",
        github: data.personalInfo?.github || "",
        photo: data.personalInfo?.photo || "",
      },
      // provide both keys to be compatible with different server/templates
      experience: (data.experience || data.experiences || []).map((e: any) => ({
        id: e.id,
        title: e.title || "",
        company: e.company || "",
        location: e.location || "",
        startDate: e.startDate || "",
        endDate: e.endDate || "",
        current: !!e.current,
        description: typeof e.description === "string" ? e.description : "",
        highlights: Array.isArray(e.highlights) ? e.highlights : [],
      })),
      experiences: (data.experience || data.experiences || []).map(
        (e: any) => ({
          id: e.id,
          title: e.title || "",
          company: e.company || "",
          location: e.location || "",
          startDate: e.startDate || "",
          endDate: e.endDate || "",
          current: !!e.current,
          description: typeof e.description === "string" ? e.description : "",
          highlights: Array.isArray(e.highlights) ? e.highlights : [],
        }),
      ),
      education: (data.education || []).map((ed: any) => ({
        id: ed.id,
        degree: ed.degree || "",
        institution: ed.institution || "",
        startDate: ed.startDate || "",
        endDate: ed.endDate || "",
        location: ed.location || "",
        gpa: ed.gpa || "",
      })),
      skills: (data.skills || []).map((s: any) => ({
        category: s.category || "",
        items: Array.isArray(s.items) ? s.items : [],
      })),
      languages: (data.languages || []).map((l: any) =>
        typeof l === "string"
          ? l
          : `${l.language || ""}${l.proficiency ? " - " + l.proficiency : ""}`,
      ),
      projects: (data.projects || []).map((p: any) => ({
        id: p.id,
        name: p.name || "",
        description: typeof p.description === "string" ? p.description : "",
        technologies: Array.isArray(p.technologies) ? p.technologies : [],
      })),
      certifications: (data.certifications || []).map((c: any) => ({
        id: c.id,
        name: c.name || "",
        issuer: c.issuer || "",
        date: c.date || "",
      })),
      awards: (data.awards || []).map((a: any) => ({
        id: a.id,
        title: a.title || "",
        issuer: a.issuer || "",
        date: a.date || "",
      })),
      settings: data.settings || {},
    };
  }

  // convert image URL to data URL so server-side PDF can embed it
  async function fetchImageAsDataURL(url: string) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return "";
      const blob = await res.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      const chunk = 0x8000;
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode.apply(
          null,
          Array.prototype.slice.call(bytes, i, i + chunk),
        );
      }
      const base64 = btoa(binary);
      const mime = blob.type || "image/png";
      return `data:${mime};base64,${base64}`;
    } catch (err) {
      console.error("fetchImageAsDataURL error:", err);
      return "";
    }
  }

  const handleDownload = async () => {
    if (isExporting) return;
    setIsExporting(true);
    const loadingToast = toast.loading("Generating PDF...");
    try {
      const normalized = normalizeCV(cvData);

      // embed photo as data URL (if available and not already embedded)
      if (
        normalized.personalInfo.photo &&
        typeof normalized.personalInfo.photo === "string" &&
        !normalized.personalInfo.photo.startsWith("data:")
      ) {
        const dataUrl = await fetchImageAsDataURL(
          normalized.personalInfo.photo,
        );
        if (dataUrl) normalized.personalInfo.photo = dataUrl;
      }

      const payload = {
        cvData: normalized,
        template: settings.template,
        colorScheme: settings.colorScheme,
      };

      const res = await fetch("/api/cv/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate PDF");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(cvData.personalInfo?.fullName || "CV").replace(
        /\s+/g,
        "_",
      )}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.dismiss(loadingToast);
      toast.success("PDF downloaded!");
    } catch (error: unknown) {
      toast.dismiss(loadingToast);
      const message =
        error instanceof Error ? error.message : "Failed to download PDF";
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSave = async () => {
    localStorage.setItem(
      "cv-data-backup",
      JSON.stringify({ cvData, settings }),
    );
    const applicationId = searchParams.get("applicationId") || undefined;
    const title =
      cvData.personalInfo.title?.trim() ||
      cvData.personalInfo.fullName?.trim() ||
      "Tailored CV";

    try {
      const res = await fetch("/api/cv/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content: { cvData, settings },
          applicationId,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to sync CV to database");
      }
      toast.success(
        applicationId
          ? "CV saved and linked to your target role."
          : "CV saved to your account.",
      );
    } catch {
      toast.success("CV saved locally.");
    }
  };

  const view = showPreview
    ? "preview"
    : activeTab === "editor"
      ? "edit"
      : "review";

  return (
    <div className={styles.workspace} data-view={view}>
      <header className={styles.commandBar}>
        <h1 className={styles.title}>CV Builder</h1>
        <div className={styles.roleControl}>
          {applicationsList.length > 0 && (
            <label className={styles.rolePicker}>
              <span id="cv-target-role-label">Target role</span>
              <select
                aria-labelledby="cv-target-role-label"
                value={searchParams.get("applicationId") ?? ""}
                onChange={(event) => {
                  const id = event.target.value;
                  router.replace(
                    id
                      ? `/cv-builder?applicationId=${encodeURIComponent(id)}`
                      : "/cv-builder",
                  );
                }}
              >
                <option value="">General CV</option>
                {applicationsList.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.company} · {app.role}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <div className={styles.actions}>
          <Button variant="ghost" size="sm" onClick={handleSave}>
            Save
          </Button>
          <ExportPanel />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="CV actions">
                <MoreHorizontal aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled={!canUndo()} onSelect={undo}>
                <Undo2 aria-hidden="true" /> Undo
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!canRedo()} onSelect={redo}>
                <Redo2 aria-hidden="true" /> Redo
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLinkedInImport}>
                <Linkedin aria-hidden="true" /> Import from LinkedIn
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isExporting}
                onSelect={handleDownload}
              >
                <Download aria-hidden="true" /> Download PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <fieldset className={styles.mobileModes}>
        <legend className="sr-only">CV workspace view</legend>
        <button
          type="button"
          aria-pressed={view === "edit"}
          onClick={() => {
            setShowPreview(false);
            setActiveTab("editor");
          }}
        >
          Edit
        </button>
        <button
          type="button"
          aria-pressed={view === "preview"}
          onClick={() => setShowPreview(true)}
        >
          Preview
        </button>
        <button
          type="button"
          aria-pressed={view === "review"}
          onClick={() => {
            setShowPreview(false);
            if (activeTab === "editor") setActiveTab("ats-matcher");
          }}
        >
          Review
        </button>
      </fieldset>

      <div className={styles.panes}>
        <section
          className={styles.editorPane}
          aria-label="CV editing and review"
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex h-full min-h-0 flex-col gap-0"
          >
            <TabsList aria-label="CV tools" className={styles.toolTabs}>
              <TabsTrigger value="editor" className={styles.editTool}>
                Edit
              </TabsTrigger>
              <TabsTrigger value="ats-matcher">ATS match</TabsTrigger>
              <TabsTrigger value="ai-suggestions">Suggestions</TabsTrigger>
              <TabsTrigger value="skills-gap">Skills gap</TabsTrigger>
            </TabsList>
            <TabsContent value="editor" className={styles.panel} forceMount>
              <EditorPanel />
            </TabsContent>
            <TabsContent value="ats-matcher" className={styles.panel}>
              <ATSMatcherPanel />
            </TabsContent>
            <TabsContent value="ai-suggestions" className={styles.panel}>
              <AISuggestionPanel />
            </TabsContent>
            <TabsContent value="skills-gap" className={styles.panel}>
              <SkillsGapAnalyzer />
            </TabsContent>
          </Tabs>
        </section>
        <section className={styles.previewPane} aria-label="CV preview">
          <PreviewPanel />
        </section>
      </div>
    </div>
  );
}

export default CanvaLayout;
