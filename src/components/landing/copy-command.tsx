"use client";

import { Check, Copy, Terminal } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CopyCommandProps {
  command: string;
  className?: string;
}

export function CopyCommand({ command, className }: CopyCommandProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable in insecure contexts
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-[#090b10] px-4 py-3 text-white",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <Terminal className="size-4 shrink-0 text-[#60a5fa]" />
        <code className="min-w-0 bg-transparent font-mono text-xs wrap-anywhere text-white/90 sm:text-[13px]">
          {command}
        </code>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Copied command" : "Copy command"}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-white/85 transition-colors hover:bg-white/12 hover:text-white"
      >
        {copied ? (
          <>
            <Check className="size-3.5 text-[#60a5fa]" />
            <span>Copied</span>
          </>
        ) : (
          <>
            <Copy className="size-3.5" />
            <span>Copy</span>
          </>
        )}
      </button>
    </div>
  );
}
