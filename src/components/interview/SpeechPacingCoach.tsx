"use client";

import {
  Cpu,
  Gauge,
  Info,
  Loader2,
  MessageSquareWarning,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type BrowserAIAvailability,
  checkBrowserAIAvailability,
  runLocalBrowserCoach,
} from "@/lib/ai/browser-ai";
import { analyzeSpeechMetrics, type PacingStatus } from "@/lib/speech-metrics";
import { cn } from "@/lib/utils";

interface SpeechPacingCoachProps {
  transcript: string;
  elapsedSeconds: number;
  question: string;
  className?: string;
}

const PACING_META: Record<PacingStatus, { label: string; badgeClass: string }> =
  {
    idle: {
      label: "Ready",
      badgeClass: "bg-muted text-muted-foreground border-border",
    },
    "too-slow": {
      label: "Too Slow",
      badgeClass: "bg-secondary text-secondary-foreground border-border",
    },
    ideal: {
      label: "Ideal Pace",
      badgeClass: "bg-primary/10 text-primary border-primary/25",
    },
    "too-fast": {
      label: "Too Fast",
      badgeClass: "bg-destructive/10 text-destructive border-destructive/25",
    },
  };

export function SpeechPacingCoach({
  transcript,
  elapsedSeconds,
  question,
  className,
}: SpeechPacingCoachProps) {
  const [aiAvailability, setAiAvailability] =
    useState<BrowserAIAvailability>("unavailable");
  const [isCoaching, setIsCoaching] = useState(false);
  const [localTip, setLocalTip] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const metrics = useMemo(
    () => analyzeSpeechMetrics(transcript, elapsedSeconds),
    [transcript, elapsedSeconds],
  );

  useEffect(() => {
    let active = true;
    checkBrowserAIAvailability().then((status) => {
      if (active) setAiAvailability(status);
    });
    return () => {
      active = false;
    };
  }, []);

  const pacingMeta = PACING_META[metrics.pacingStatus];
  const canUseLocalAI =
    aiAvailability === "available" || aiAvailability === "downloadable";

  const handleQuickLocalTip = async () => {
    if (!transcript.trim() || isCoaching) return;
    setIsCoaching(true);
    setLocalError(null);
    try {
      const tip = await runLocalBrowserCoach(question, transcript);
      setLocalTip(tip);
    } catch (error) {
      setLocalError(
        error instanceof Error
          ? error.message
          : "Unable to run local browser coach.",
      );
    } finally {
      setIsCoaching(false);
    }
  };

  return (
    <TooltipProvider>
      <div
        className={cn(
          "rounded-xl border border-border bg-card p-3.5 text-card-foreground space-y-2.5",
          className,
        )}
      >
        {/* Top Metrics Row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <Gauge className="h-4 w-4 text-primary shrink-0" />
              <span className="font-display text-sm font-semibold tabular-nums text-foreground">
                {metrics.wpm} WPM
              </span>
            </div>

            <Badge
              variant="outline"
              className={cn(
                "text-[11px] font-medium px-2 py-0.5",
                pacingMeta.badgeClass,
              )}
            >
              {pacingMeta.label}
            </Badge>

            <span className="text-xs text-muted-foreground tabular-nums">
              {metrics.wordCount} {metrics.wordCount === 1 ? "word" : "words"}
            </span>

            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs tabular-nums",
                metrics.fillerCount > 0
                  ? "text-foreground font-medium"
                  : "text-muted-foreground",
              )}
            >
              {metrics.fillerCount > 0 && (
                <MessageSquareWarning className="h-3.5 w-3.5 text-primary shrink-0" />
              )}
              {metrics.fillerCount}{" "}
              {metrics.fillerCount === 1 ? "filler" : "fillers"}
              {metrics.fillerCount > 0 && ` (${metrics.fillerRate}%)`}
            </span>
          </div>

          {/* Local Chrome AI Tip Trigger */}
          {canUseLocalAI ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleQuickLocalTip}
              disabled={isCoaching || !transcript.trim()}
              className="h-7 px-2.5 text-xs font-medium border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
            >
              {isCoaching ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Coaching...
                </>
              ) : (
                <>
                  <Cpu className="h-3.5 w-3.5 mr-1.5" />
                  Quick Local AI Tip
                </>
              )}
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground cursor-help">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  {aiAvailability === "downloading"
                    ? "Local AI downloading"
                    : "Local AI unavailable"}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs">
                On-device coaching uses Chrome&apos;s built-in Prompt API
                (LanguageModel). Enable it in Chrome flags for instant offline
                tips.
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Conciseness Coaching Cue */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {metrics.concisenessHint}
        </p>

        {/* Filler Word Breakdown */}
        {metrics.fillerBreakdown.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {metrics.fillerBreakdown.slice(0, 6).map((item) => (
              <span
                key={item.word}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground tabular-nums"
              >
                <span>&ldquo;{item.word}&rdquo;</span>
                <span className="text-muted-foreground">×{item.count}</span>
              </span>
            ))}
          </div>
        )}

        {/* On-Device AI Tip Output */}
        {(localTip || localError) && (
          <div
            className={cn(
              "rounded-lg border p-2.5 text-xs leading-relaxed relative pr-7",
              localError
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-primary/25 bg-accent/60 text-foreground",
            )}
          >
            <button
              type="button"
              onClick={() => {
                setLocalTip(null);
                setLocalError(null);
              }}
              aria-label="Dismiss local AI tip"
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <p className="font-display font-semibold text-[11px] text-primary mb-1">
              {localError ? "Local AI Notice" : "On-Device Coach"}
            </p>
            <p className="whitespace-pre-line">{localError || localTip}</p>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
