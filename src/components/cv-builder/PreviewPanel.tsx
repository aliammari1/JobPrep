"use client";

import { Maximize2, Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCVStore } from "@/store/cv-store";
import { CustomizePanel } from "./CustomizePanel";
import styles from "./cv-workspace.module.css";
import { ClassicTemplate } from "./templates/ClassicTemplate";
import { MinimalTemplate } from "./templates/MinimalTemplate";
import { ModernTemplate } from "./templates/ModernTemplate";

const paperWidth = (210 * 96) / 25.4;
const paperHeight = (297 * 96) / 25.4;

const templates = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
};

export function PreviewPanel() {
  const { cvData, settings } = useCVStore();
  const [zoom, setZoom] = useState(1);
  const [availableWidth, setAvailableWidth] = useState(0);
  const [contentHeight, setContentHeight] = useState(paperHeight);
  const viewportRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const paper = paperRef.current;
    if (!viewport || !paper) return;

    const observer = new ResizeObserver(() => {
      const width = viewport.clientWidth;
      const height = paper.offsetHeight;
      if (width > 0) setAvailableWidth(width - 24);
      if (height > 0) setContentHeight(height);
    });
    observer.observe(viewport);
    observer.observe(paper);
    return () => observer.disconnect();
  }, []);

  const fit = Math.min(1, (availableWidth || paperWidth) / paperWidth);
  const scale = fit * zoom;
  const Template = templates[settings.template] ?? ModernTemplate;

  return (
    <div className={styles.preview}>
      <div className={styles.previewBar}>
        <span className={styles.paperLabel}>A4 preview</span>
        <fieldset className={styles.zoomControls}>
          <legend className="sr-only">Preview zoom</legend>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Zoom out"
            disabled={zoom <= 0.75}
            onClick={() => setZoom((level) => Math.max(0.75, level - 0.25))}
          >
            <Minus aria-hidden="true" />
          </Button>
          <span className={styles.zoomLevel}>{Math.round(scale * 100)}%</span>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Zoom in"
            disabled={zoom >= 2}
            onClick={() => setZoom((level) => Math.min(2, level + 0.25))}
          >
            <Plus aria-hidden="true" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Fit to width"
            onClick={() => setZoom(1)}
          >
            <Maximize2 aria-hidden="true" />
          </Button>
        </fieldset>
        <CustomizePanel />
      </div>

      <div className={styles.previewScroll} ref={viewportRef}>
        <div className={styles.paperStage}>
          <div
            className={styles.paperFrame}
            style={{ width: paperWidth * scale, height: contentHeight * scale }}
          >
            <div
              ref={paperRef}
              className={styles.paper}
              style={{
                width: paperWidth,
                minHeight: paperHeight,
                transform: `scale(${scale})`,
              }}
            >
              <Template cvData={cvData} settings={settings} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
