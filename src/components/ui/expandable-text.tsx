"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Clamped long-form text (feedback, answers, parsed documents) with a
 * built-in expand/collapse — clamped text without a recovery path traps
 * content, so every usage of line-clamp on user content should go through
 * this instead of raw `line-clamp-N`.
 */
export function ExpandableText({
  text,
  clampLines = 6,
  className,
  preserveWhitespace = true,
}: {
  text: string;
  clampLines?: 2 | 3 | 4 | 6;
  className?: string;
  preserveWhitespace?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  // Rough overflow heuristic: only offer expansion when the text is long
  // enough to plausibly exceed the clamp (~90 chars per line).
  const expandable = text.length > clampLines * 90;

  return (
    <div>
      <p
        title={expanded ? undefined : text}
        className={cn(
          preserveWhitespace && "whitespace-pre-wrap",
          "break-words text-sm leading-relaxed select-text",
          !expanded &&
            (clampLines === 2
              ? "line-clamp-2"
              : clampLines === 3
                ? "line-clamp-3"
                : clampLines === 4
                  ? "line-clamp-4"
                  : "line-clamp-6"),
          className,
        )}
      >
        {text}
      </p>
      {expandable && (
        <Button
          type="button"
          variant="link"
          size="sm"
          className="mt-1 h-auto p-0 text-xs"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Show less" : "Show more"}
        </Button>
      )}
    </div>
  );
}
