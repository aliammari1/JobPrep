"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Code2, Cpu, Gauge, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type TabId = "mock" | "code" | "models";
type AnswerVariant = "raw" | "refined";
type ProviderId = "claude" | "openai" | "gemini" | "ollama";

const TABS: {
  id: TabId;
  label: string;
  icon: React.ElementType;
}[] = [
  {
    id: "mock",
    label: "Mock Interview Rubric",
    icon: Gauge,
  },
  {
    id: "code",
    label: "Code Challenge Arena",
    icon: Code2,
  },
  {
    id: "models",
    label: "BYOK & Local Ollama",
    icon: Cpu,
  },
];

const ANSWER_VARIANTS: Record<
  AnswerVariant,
  {
    label: string;
    score: number;
    transcript: string;
    rubric: { label: string; score: number }[];
    note: string;
  }
> = {
  raw: {
    label: "First attempt",
    score: 64,
    transcript:
      "We had a slow checkout API last quarter. I profiled the database and added some indexes and caching, and after that it was a lot faster for users.",
    rubric: [
      { label: "STAR structure", score: 58 },
      { label: "Technical depth", score: 62 },
      { label: "Quantified impact", score: 45 },
    ],
    note: "Too high-level. Name the exact bottleneck, quantify latency before and after, and explain the cache invalidation trade-off.",
  },
  refined: {
    label: "Revised answer",
    score: 91,
    transcript:
      "Checkout p95 spiked to 420ms during flash sales due to an unindexed composite lookup. I added a covering index and write-through Redis cache with a 60s TTL, cutting p95 to 98ms with zero stale-price incidents.",
    rubric: [
      { label: "STAR structure", score: 94 },
      { label: "Technical depth", score: 90 },
      { label: "Quantified impact", score: 92 },
    ],
    note: "The before-and-after latency makes the result concrete. A follow-up could explain how writes kept the cache current.",
  },
};

const PROVIDERS: Record<
  ProviderId,
  {
    name: string;
    model: string;
    mode: string;
    cost: string;
    privacy: string;
    envLine: string;
  }
> = {
  claude: {
    name: "Anthropic",
    model: "claude-sonnet-4",
    mode: "Bring your own key",
    cost: "Provider pricing applies",
    privacy: "Selected provider receives the prompt",
    envLine: 'ANTHROPIC_API_KEY="..."',
  },
  openai: {
    name: "OpenAI",
    model: "gpt-4o / o3-mini",
    mode: "Bring your own key",
    cost: "Provider pricing applies",
    privacy: "Selected provider receives the prompt",
    envLine: 'OPENAI_API_KEY="..."',
  },
  gemini: {
    name: "Google Gemini",
    model: "gemini-2.5-pro",
    mode: "Bring your own key",
    cost: "Provider pricing applies",
    privacy: "Selected provider receives the prompt",
    envLine: 'GEMINI_API_KEY="..."',
  },
  ollama: {
    name: "Local Ollama",
    model: "llama3.1 / qwen2.5-coder",
    mode: "Self-hosted inference",
    cost: "Uses your hardware",
    privacy: "Prompts go to the configured Ollama server",
    envLine: 'OLLAMA_HOST="http://localhost:11434/v1"',
  },
};

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function HeroShowcase() {
  const [activeTab, setActiveTab] = useState<TabId>("mock");
  const [answerVariant, setAnswerVariant] = useState<AnswerVariant>("raw");
  const [showTestResults, setShowTestResults] = useState(false);
  const [provider, setProvider] = useState<ProviderId>("ollama");

  const currentAnswer = ANSWER_VARIANTS[answerVariant];
  const currentProvider = PROVIDERS[provider];

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_70px_-30px_rgba(15,23,42,0.18)] dark:shadow-[0_24px_70px_-30px_rgba(0,0,0,0.65)]">
      {/* Clean Studio Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/45 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-foreground/15" />
          <span className="size-2.5 rounded-full bg-foreground/15" />
          <span className="size-2.5 rounded-full bg-primary" />
          <span className="ml-2 hidden font-mono text-xs text-muted-foreground sm:inline">
            Interactive preview
          </span>
        </div>

        {/* Segmented Tab Switcher */}
        <div
          role="tablist"
          aria-label="JobPrep interactive preview"
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-background p-1"
        >
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <tab.icon className="size-3.5 shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Spacious Two-Column Interactive Body */}
      <div className="p-6 sm:p-8 lg:p-10">
        <AnimatePresence mode="wait">
          {activeTab === "mock" && (
            <motion.div
              key="mock"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
              className="grid gap-8 lg:grid-cols-12 lg:items-start"
            >
              {/* Left: Question & Switchable Answer */}
              <div className="space-y-4 lg:col-span-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Senior Backend Engineer · Question 3 of 5
                    </p>
                    <h3 className="mt-1 font-display text-xl font-semibold tracking-tight text-foreground">
                      Walk through a production latency bottleneck you resolved.
                    </h3>
                  </div>
                </div>

                <div className="inline-flex rounded-lg border border-border bg-muted/50 p-1 text-xs">
                  {(["raw", "refined"] as const).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setAnswerVariant(key)}
                      className={cn(
                        "rounded-md px-3 py-1.5 font-medium transition-colors",
                        answerVariant === key
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {ANSWER_VARIANTS[key].label}
                    </button>
                  ))}
                </div>

                <div className="rounded-xl border border-border bg-muted/35 p-5 text-sm leading-relaxed text-foreground">
                  &ldquo;{currentAnswer.transcript}&rdquo;
                </div>

                <div className="rounded-xl border border-border bg-accent/50 p-4 text-sm leading-relaxed text-foreground/90">
                  <span className="font-semibold text-foreground">
                    Coach note:{" "}
                  </span>
                  {currentAnswer.note}
                </div>
              </div>

              {/* Right: Live Rubric Breakdown */}
              <div className="rounded-xl border border-border bg-muted/25 p-6 lg:col-span-5">
                <div className="flex items-baseline justify-between border-b border-border pb-4">
                  <span className="text-sm font-medium text-muted-foreground">
                    Overall score
                  </span>
                  <span className="font-display text-3xl font-bold tracking-tight text-primary tabular-nums">
                    {currentAnswer.score}
                    <span className="text-base font-medium text-muted-foreground">
                      /100
                    </span>
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  {currentAnswer.rubric.map((item) => (
                    <div key={item.label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-foreground">{item.label}</span>
                        <span className="text-muted-foreground tabular-nums">
                          {item.score}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={false}
                          animate={{ width: `${item.score}%` }}
                          transition={{ duration: 0.38, ease: EASE_OUT_EXPO }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "code" && (
            <motion.div
              key="code"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
              className="grid gap-8 lg:grid-cols-12 lg:items-start"
            >
              <div className="space-y-4 lg:col-span-7">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Medium · Token Bucket
                    </p>
                    <h3 className="mt-0.5 font-display text-xl font-semibold tracking-tight text-foreground">
                      Rate Limiter Token Bucket
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTestResults((visible) => !visible)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {showTestResults
                      ? "Hide sample results"
                      : "Show sample results"}
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-black/10 bg-[#090b10] p-4 font-mono text-xs leading-relaxed text-white/90">
                  <pre>
                    <code>{`export function allowRequest(bucket: Bucket, now: number): boolean {
  const elapsed = (now - bucket.lastRefill) / 1000;
  bucket.tokens = Math.min(bucket.capacity, bucket.tokens + elapsed * bucket.rate);
  bucket.lastRefill = now;
  if (bucket.tokens < 1) return false;
  bucket.tokens -= 1;
  return true;
}`}</code>
                  </pre>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-border bg-muted/25 p-6 lg:col-span-5">
                <div className="flex items-center justify-between border-b border-border pb-3 text-xs">
                  <span className="font-semibold text-foreground">
                    {showTestResults
                      ? "Sample results · 4 passed"
                      : "Example test cases"}
                  </span>
                  <span className="font-medium text-primary tabular-nums">
                    O(1) time · O(1) space
                  </span>
                </div>
                <div className="space-y-2 pt-1 text-xs">
                  {[
                    "Burst within capacity",
                    "Rejects when depleted",
                    "Refills smoothly over time",
                    "Caps at max capacity",
                  ].map((label) => (
                    <div
                      key={label}
                      className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 text-foreground"
                    >
                      <span
                        className={cn(
                          "grid size-4 shrink-0 place-items-center rounded-full",
                          showTestResults
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        <Check className="size-2.5" />
                      </span>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "models" && (
            <motion.div
              key="models"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
              className="grid gap-8 lg:grid-cols-12 lg:items-start"
            >
              <div className="space-y-4 lg:col-span-5">
                <div>
                  <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
                    Swap AI engines per session
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    Connect Anthropic, OpenAI, or Gemini with your own key, or
                    run inference on your own Ollama server.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(PROVIDERS) as ProviderId[]).map((id) => {
                    const active = provider === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setProvider(id)}
                        className={cn(
                          "rounded-lg border px-3 py-2.5 text-left text-xs font-semibold transition-colors",
                          active
                            ? "border-primary bg-accent text-accent-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                        )}
                      >
                        {PROVIDERS[id].name}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="size-4 shrink-0 text-primary" />
                  <span>Set provider keys on the JobPrep server.</span>
                </div>
              </div>

              <div className="space-y-4 lg:col-span-7">
                <div className="space-y-3 rounded-xl border border-border bg-muted/25 p-5 text-sm">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="text-muted-foreground">Model</span>
                    <span className="font-semibold text-foreground">
                      {currentProvider.model}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="text-muted-foreground">Deployment</span>
                    <span className="font-medium text-primary">
                      {currentProvider.mode}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="text-muted-foreground">Cost</span>
                    <span className="text-foreground">
                      {currentProvider.cost}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-muted-foreground">Privacy</span>
                    <span className="text-right text-foreground">
                      {currentProvider.privacy}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-black/10 bg-[#090b10] px-4 py-3.5 font-mono text-xs text-[#93c5fd]">
                  <code>{currentProvider.envLine}</code>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
