"use client";

import { useState, useCallback, useRef } from "react";
import { useCVStore } from "@/store/cv-store";
import { Button } from "@/components/ui/button";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileDown,
  FileText,
  FileJson,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModernTemplate } from "./templates/ModernTemplate";
import { ClassicTemplate } from "./templates/ClassicTemplate";
import { MinimalTemplate } from "./templates/MinimalTemplate";
import { TextSelectionToolbar } from "./TextSelectionToolbar";
import { useTextSelection } from "@/hooks/useTextSelection";
import { toast } from "sonner";

export function PreviewPanel() {
  const { cvData, settings } = useCVStore();
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const selection = useTextSelection(previewContainerRef);

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 10, 200));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 10, 50));
  }, []);

  const handleFitToPage = useCallback(() => {
    setZoomLevel(100);
  }, []);

  const handleTextAction = async (action: string, text: string) => {
    switch (action) {
      case "ai-enhance":
        toast.loading("Enhancing text with AI...");
        // TODO: Implement AI enhancement API
        setTimeout(() => {
          toast.dismiss();
          toast.success("Text enhanced!");
        }, 1000);
        break;
      case "bold":
        document.execCommand("bold");
        toast.success("Applied bold formatting");
        break;
      case "italic":
        document.execCommand("italic");
        toast.success("Applied italic formatting");
        break;
      case "translate":
        toast.loading("Translating text...");
        // TODO: Implement translation API
        setTimeout(() => {
          toast.dismiss();
          toast.success("Text translated!");
        }, 1000);
        break;
      case "expand":
        toast.loading("Expanding text...");
        // TODO: Implement expansion API
        setTimeout(() => {
          toast.dismiss();
          toast.success("Text expanded!");
        }, 1000);
        break;
      case "shorten":
        toast.loading("Shortening text...");
        // TODO: Implement shortening API
        setTimeout(() => {
          toast.dismiss();
          toast.success("Text shortened!");
        }, 1000);
        break;
      case "copy":
        await navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
        break;
    }
  };

  const handleExportPDF = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify({ cvData, settings }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cvData.personalInfo.fullName || "CV"}_data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success("JSON exported!");
  };

  const handleExportTXT = () => {
    let txtContent = `${cvData.personalInfo.fullName}\n`;
    txtContent += `${cvData.personalInfo.title}\n\n`;
    txtContent += `Contact:\n`;
    txtContent += `Email: ${cvData.personalInfo.email}\n`;
    txtContent += `Phone: ${cvData.personalInfo.phone}\n`;
    txtContent += `Location: ${cvData.personalInfo.location}\n\n`;
    txtContent += `Summary:\n${cvData.personalInfo.summary}\n\n`;

    if (cvData.experience.length > 0) {
      txtContent += `Experience:\n`;
      cvData.experience.forEach((exp) => {
        txtContent += `- ${exp.title} at ${exp.company}\n`;
        txtContent += `  ${exp.startDate} - ${exp.current ? "Present" : exp.endDate}\n`;
        txtContent += `  ${exp.description}\n\n`;
      });
    }

    if (cvData.education.length > 0) {
      txtContent += `Education:\n`;
      cvData.education.forEach((edu) => {
        txtContent += `- ${edu.degree} from ${edu.institution}\n`;
        txtContent += `  ${edu.startDate} - ${edu.endDate}\n\n`;
      });
    }

    if (cvData.skills.length > 0) {
      txtContent += `Skills:\n`;
      cvData.skills.forEach((skill) => {
        txtContent += `- ${skill.category}: ${skill.items.join(", ")}\n`;
      });
    }

    const blob = new Blob([txtContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cvData.personalInfo.fullName || "CV"}_Resume.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success("TXT exported!");
  };

  const renderTemplate = () => {
    switch (settings.template) {
      case "modern":
        return <ModernTemplate cvData={cvData} settings={settings} />;
      case "classic":
        return <ClassicTemplate cvData={cvData} settings={settings} />;
      case "minimal":
        return <MinimalTemplate cvData={cvData} settings={settings} />;
      default:
        return <ModernTemplate cvData={cvData} settings={settings} />;
    }
  };

  return (
    <div className="flex h-full flex-col relative">
      {/* Preview Toolbar */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Preview</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="min-w-[60px] text-center text-sm">
              {zoomLevel}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFitToPage}
              title="Fit to Page"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="pdf" className="w-auto">
          <TabsList>
            <TabsTrigger value="pdf" className="text-xs">
              <FileDown className="mr-1 h-3 w-3" />
              PDF
            </TabsTrigger>
            <TabsTrigger value="json" className="text-xs">
              <FileJson className="mr-1 h-3 w-3" />
              JSON
            </TabsTrigger>
            <TabsTrigger value="txt" className="text-xs">
              <FileText className="mr-1 h-3 w-3" />
              TXT
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pdf" className="hidden">
            <Button onClick={handleExportPDF} disabled={isLoading} size="sm">
              Export PDF
            </Button>
          </TabsContent>
          <TabsContent value="json" className="hidden">
            <Button onClick={handleExportJSON} size="sm">
              Export JSON
            </Button>
          </TabsContent>
          <TabsContent value="txt" className="hidden">
            <Button onClick={handleExportTXT} size="sm">
              Export TXT
            </Button>
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview Content */}
      <ScrollArea className="flex-1 bg-muted/20 p-8">
        <div ref={previewContainerRef} className="mx-auto relative">
          <div
            className="mx-auto w-[210mm] bg-white shadow-2xl"
            style={{
              zoom: zoomLevel / 100,
              minHeight: "297mm",
            }}
          >
            {renderTemplate()}
          </div>

          {/* Text Selection Toolbar */}
          <TextSelectionToolbar
            selection={selection}
            onAction={handleTextAction}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
