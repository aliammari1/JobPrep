"use client";

import { useState, useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { EditorPanel } from "./EditorPanel";
import { PreviewPanel } from "./PreviewPanel";
import { Button } from "@/components/ui/button";
import {
  Save,
  Sparkles,
  Linkedin,
  Undo2,
  Redo2,
  Download,
  Brain,
  MessageSquare,
  Mic,
  BarChart3,
  Palette,
  GripVertical,
  Edit3,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AISuggestionPanel } from "./AISuggestionPanel";
import { InterviewQAPredictor } from "./InterviewQAPredictor";
import { VoiceToCVFeature } from "./VoiceToCVFeature";
import { SkillsGapAnalyzer } from "./SkillsGapAnalyzer";
import { CustomizePanel } from "./CustomizePanel";
import { useCVStore } from "@/store/cv-store";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";

export function CanvaLayout() {
  const [activeTab, setActiveTab] = useState("editor");

  const { cvData, settings, canUndo, canRedo, undo, redo } = useCVStore();
  const searchParams = useSearchParams();

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
  });

  // Auto-import from LinkedIn extension if dataId is present
  useEffect(() => {
    const dataId = searchParams.get("import");
    if (dataId) {
      const importLinkedInData = async () => {
        const toastId = toast.loading("Importing LinkedIn data...");
        try {
          const res = await fetch(`/api/cv/import-extension?dataId=${dataId}`);
          const result = await res.json();

          if (result.success && result.data) {
            useCVStore.getState().importData(result.data);
            toast.success("LinkedIn data imported successfully!", {
              id: toastId,
            });
          } else {
            toast.error("Failed to import LinkedIn data", { id: toastId });
          }
        } catch (error) {
          console.error("Import error:", error);
          toast.error("Failed to import LinkedIn data", { id: toastId });
        }
      };

      importLinkedInData();
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

  const handleEnhanceWithAI = async () => {
    if (!cvData.personalInfo.summary) {
      toast.error("Please add a summary first");
      return;
    }

    toast.loading("Enhancing with AI...");
    try {
      const res = await fetch("/api/cv/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvData }),
      });

      const result = await res.json();
      if (result.success) {
        useCVStore.getState().importData(result.enhancedData);
        toast.success("CV enhanced successfully!");
      } else {
        toast.error("Failed to enhance CV");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to enhance CV";
      toast.error(message);
    }
  };

  const handleSave = () => {
    localStorage.setItem(
      "cv-data-backup",
      JSON.stringify({ cvData, settings }),
    );
    toast.success("CV saved successfully!");
  };

  const handleDownload = async () => {
    const loadingToast = toast.loading("Generating PDF...");
    try {
      const res = await fetch("/api/cv/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvData, template: settings.template }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to generate PDF");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${cvData.personalInfo.fullName || "CV"}_Resume.pdf`;
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
    }
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col bg-background">
        {/* Minimal Top Toolbar */}
        <div className="flex items-center justify-between border-b px-6 py-3 bg-background/95 backdrop-blur">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-xl font-bold">CV Builder</h1>
              <p className="text-xs text-muted-foreground">
                Build your professional resume
              </p>
            </div>

            {/* History Controls */}
            <div className="flex items-center gap-1 border-l pl-6">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={undo}
                    disabled={!canUndo()}
                    className="h-8 w-8"
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Undo <kbd className="ml-1 text-xs">⌘Z</kbd>
                  </p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={redo}
                    disabled={!canRedo()}
                    className="h-8 w-8"
                  >
                    <Redo2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Redo <kbd className="ml-1 text-xs">⌘⇧Z</kbd>
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleLinkedInImport}>
              <Linkedin className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button size="sm" onClick={handleDownload} className="bg-primary">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Main Content - 2 Panel Layout */}
        <PanelGroup direction="horizontal" className="flex-1">
          {/* Left Panel - Vertical Tabs + Content */}
          <Panel defaultSize={45} minSize={30} maxSize={70}>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              orientation="vertical"
              className="h-full flex flex-row border-r"
            >
              <TabsList className="h-full w-16 flex-col justify-start gap-2 rounded-none border-r bg-muted/30 p-2 shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value="editor"
                      className="w-full aspect-square p-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <Edit3 className="h-5 w-5" />
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Editor</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value="ai-suggestions"
                      className="w-full aspect-square p-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <Brain className="h-5 w-5" />
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>
                      AI Suggestions <kbd className="ml-1 text-xs">⌘K</kbd>
                    </p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value="interview-qa"
                      className="w-full aspect-square p-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <MessageSquare className="h-5 w-5" />
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Interview Q&A</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value="voice-cv"
                      className="w-full aspect-square p-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <Mic className="h-5 w-5" />
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Voice to CV</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value="skills-gap"
                      className="w-full aspect-square p-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <BarChart3 className="h-5 w-5" />
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Skills Gap</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value="customize"
                      className="w-full aspect-square p-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <Palette className="h-5 w-5" />
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Customize</p>
                  </TooltipContent>
                </Tooltip>

                <div className="flex-1" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleEnhanceWithAI}
                      className="w-full aspect-square p-0"
                    >
                      <Sparkles className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Auto-Enhance CV</p>
                  </TooltipContent>
                </Tooltip>
              </TabsList>

              <TabsContent
                value="editor"
                className="flex-1 h-full m-0 p-0 border-0"
              >
                <ScrollArea className="h-full">
                  <EditorPanel />
                </ScrollArea>
              </TabsContent>

              <TabsContent
                value="ai-suggestions"
                className="flex-1 h-full m-0 p-0 border-0"
              >
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <AISuggestionPanel />
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent
                value="interview-qa"
                className="flex-1 h-full m-0 p-0 border-0"
              >
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <InterviewQAPredictor />
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent
                value="voice-cv"
                className="flex-1 h-full m-0 p-0 border-0"
              >
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <VoiceToCVFeature />
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent
                value="skills-gap"
                className="flex-1 h-full m-0 p-0 border-0"
              >
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <SkillsGapAnalyzer />
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent
                value="customize"
                className="flex-1 h-full m-0 p-0 border-0"
              >
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <CustomizePanel />
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </Panel>

          {/* Resizer Handle */}
          <PanelResizeHandle className="group relative w-1 cursor-col-resize bg-border hover:bg-primary/50 transition-colors data-[resize-handle-active]:bg-primary">
            <div className="absolute inset-y-0 -left-2 -right-2" />
            <GripVertical className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </PanelResizeHandle>

          {/* Preview Panel - Right Side */}
          <Panel defaultSize={55} minSize={30}>
            <div className="h-full overflow-hidden bg-gradient-to-br from-muted/5 to-muted/20">
              <PreviewPanel />
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </TooltipProvider>
  );
}

export default CanvaLayout;
