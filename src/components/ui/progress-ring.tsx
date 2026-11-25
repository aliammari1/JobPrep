"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  thickness?: number;
  label: string;
  displayValue?: string;
  className?: string;
}

export function ProgressRing({
  value,
  max = 100,
  size = 44,
  thickness = 4,
  label,
  displayValue,
  className,
}: ProgressRingProps) {
  const pct = max > 0 ? Math.max(0, Math.min(100, Math.round((value / max) * 100))) : 0;
  const shown = displayValue ?? `${pct}%`;

  const ringStyle = {
    "--progress-value": pct,
    "--ring-size": `${size}px`,
    "--ring-thickness": `${thickness}px`,
  } as CSSProperties;

  return (
    <div
      className={cn("progress-ring-wrapper", className)}
      style={{ width: size, height: size }}
    >
      <progress
        value={pct}
        max={100}
        aria-label={label}
        aria-valuetext={shown}
        className="progress-ring"
        style={ringStyle}
      />
      <span
        aria-hidden="true"
        className="progress-ring-label font-display text-[11px] font-semibold text-foreground tabular-nums"
      >
        {shown}
      </span>
    </div>
  );
}
