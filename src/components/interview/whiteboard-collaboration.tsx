"use client";

import { Share, Users } from "lucide-react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useCallback, useState } from "react";
import "@excalidraw/excalidraw/index.css";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((m) => m.Excalidraw),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[440px] w-full rounded-lg" />,
  },
);

interface Point {
  x: number;
  y: number;
}

export interface DrawingElement {
  id: string;
  type: string;
  [key: string]: unknown;
}

interface WhiteboardCollaborationProps {
  isCollaborative?: boolean;
  participants?: Array<{
    id: string;
    name: string;
    color: string;
    cursor?: Point;
  }>;
  onSave?: (elements: DrawingElement[]) => void;
  onShare?: () => void;
  className?: string;
}

export function WhiteboardCollaboration({
  isCollaborative = false,
  participants = [],
  onSave,
  onShare,
  className,
}: WhiteboardCollaborationProps) {
  const { resolvedTheme } = useTheme();
  const [elementCount, setElementCount] = useState(0);

  const handleChange = useCallback(
    (elements: readonly Record<string, unknown>[]) => {
      const active = elements.filter((el) => !el.isDeleted);
      setElementCount(active.length);
      if (onSave) {
        onSave(active as unknown as DrawingElement[]);
      }
    },
    [onSave],
  );

  return (
    <Card className={cn("overflow-hidden shadow-none", className)}>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 border-b border-border py-3">
        <div className="flex items-center gap-2">
          <CardTitle className="font-display text-base">Whiteboard</CardTitle>
          {isCollaborative && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <Users className="size-3" />
              {participants.length || 1} live
            </Badge>
          )}
          <span className="text-xs text-muted-foreground tabular-nums">
            {elementCount} {elementCount === 1 ? "item" : "items"}
          </span>
        </div>
        {onShare && (
          <Button variant="outline" size="sm" onClick={onShare}>
            <Share className="mr-1.5 size-3.5" />
            Share
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div
          className="h-[460px] w-full touch-none sm:h-[540px]"
          style={{ contain: "strict" }}
        >
          <Excalidraw
            theme={resolvedTheme === "dark" ? "dark" : "light"}
            onChange={(els) =>
              handleChange(els as readonly Record<string, unknown>[])
            }
            UIOptions={{
              canvasActions: {
                loadScene: false,
                saveToActiveFile: false,
                toggleTheme: false,
              },
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
