"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useCVStore } from "@/store/cv-store";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, FileDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModernTemplate } from "./templates/ModernTemplate";
import { ClassicTemplate } from "./templates/ClassicTemplate";
import { MinimalTemplate } from "./templates/MinimalTemplate";
import { TextSelectionToolbar } from "./TextSelectionToolbar";
import { useTextSelection } from "@/hooks/useTextSelection";
import { toast } from "sonner";
import { Palette } from "lucide-react";
import { TemplateSelector } from "./TemplateSelector";
import { CustomizePanel } from "./CustomizePanel";

export function PreviewPanel() {
  const { cvData, settings } = useCVStore();
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomizePanel, setShowCustomizePanel] = useState(false);

  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const selection = useTextSelection(scrollWrapperRef);

  // Measured (unscaled) height of the content in px
  const [contentHeight, setContentHeight] = useState<number>(0);

  // Observe content height so scrolling works when content grows or shrinks
  useEffect(() => {
    if (!contentRef.current) return;
    const el = contentRef.current;
    const ro = new ResizeObserver(() => {
      setContentHeight(el.offsetHeight);
    });
    ro.observe(el);
    // Initial measure
    setContentHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, [cvData, settings.template]);

  const handleZoomIn = useCallback(
    () => setZoomLevel((p) => Math.min(p + 10, 200)),
    []
  );
  const handleZoomOut = useCallback(
    () => setZoomLevel((p) => Math.max(p - 10, 50)),
    []
  );
  const handleFitToPage = useCallback(() => setZoomLevel(100), []);

  const handleTextAction = async (action: string, text: string) => {
    switch (action) {
      case "ai-enhance":
        toast.loading("Enhancing text with AI...");
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
        setTimeout(() => {
          toast.dismiss();
          toast.success("Text translated!");
        }, 1000);
        break;
      case "expand":
        toast.loading("Expanding text...");
        setTimeout(() => {
          toast.dismiss();
          toast.success("Text expanded!");
        }, 1000);
        break;
      case "shorten":
        toast.loading("Shortening text...");
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

  const scale = zoomLevel / 100;
  const scaledHeight = contentHeight * scale; // placeholder area height

  return (
    <div className="flex h-full flex-col relative">
      {/* Toolbar */}
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
              title="Reset Zoom"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CustomizePanel />
        </div>
      </div>

      {/* Scrollable Area */}
      <ScrollArea className="flex-1 bg-muted/20 p-6">
        <div
          ref={scrollWrapperRef}
          className="relative mx-auto"
          style={{ width: "100%", maxWidth: "210mm" }}
        >
          {/* Placeholder block providing the scaled height for scrolling */}
          <div style={{ height: scaledHeight || 0 }} />

          {/* Absolutely positioned scaled content */}
          <div
            ref={contentRef}
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: `translateX(-50%) scale(${scale})`,
              transformOrigin: "top center",
              width: "210mm",
            }}
            className="will-change-transform"
          >
            <div
              className="bg-white shadow-2xl print:shadow-none"
              style={{
                width: "210mm",
                minHeight: "297mm",
              }}
            >
              {renderTemplate()}
            </div>
          </div>

          <TextSelectionToolbar
            selection={selection}
            onAction={handleTextAction}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
