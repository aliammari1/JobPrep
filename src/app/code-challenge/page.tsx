"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const CodeEditorEnhanced = dynamic(
  () =>
    import("@/components/code-challenge/CodeEditorEnhanced").then(
      (m) => m.CodeEditorEnhanced,
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="min-h-[420px] w-full rounded-lg" />,
  },
);
import { ProblemPanel } from "@/components/code-challenge/ProblemPanel";
import { TestResultsPanel } from "@/components/code-challenge/TestResultsPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { invalidateAPICache, useAPIRequest } from "@/hooks/use-api-request";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useChallenges } from "@/hooks/use-challenges";
import { useCodeExecution } from "@/hooks/use-code-execution";
import { useGenerateChallenges } from "@/hooks/use-generate-challenges";
import { useSubmissions } from "@/hooks/use-submissions";
import { useCodeChallengeStore } from "@/store/code-challenge-store";

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
  executionTime?: number;
}

interface Challenge {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  constraints: string[];
  examples: Array<{ input: string; output: string; explanation: string }>;
  testCases: TestCase[];
  timeLimit: number;
  memoryLimit: number;
  hints?: string[];
  starterCode?: Record<string, string>;
}

// Default starter code templates
const DEFAULT_CODE = {
  javascript: `function solution() {
  // Your solution here
}`,
  python: `def solution():
    # Your solution here
    pass`,
  java: `public class Solution {
    public void solution() {
        // Your solution here
    }
}`,
  cpp: `#include <vector>
using namespace std;

class Solution {
public:
    void solution() {
        // Your solution here
    }
};`,
  typescript: `function solution(): void {
  // Your solution here
}`,
  go: `func solution() {
    // Your solution here
}`,
};

/**
 * Refactored Code Challenge Arena with optimized state management
 * - Zustand for centralized state
 * - API request deduplication
 * - Server-side auto-save every 10 seconds
 * - Proper keyboard event cleanup
 * - Single-source-of-truth for code and state
 */
export default function CodeChallengeArena() {
  const router = useRouter();
  const { executeCode, isExecuting } = useCodeExecution();
  const {
    isLoading: isChallengeLoading,
  } = useChallenges();
  const { submitSolution, isSubmitting } = useSubmissions();
  const { generateChallenges, isGenerating } = useGenerateChallenges();

  // Use Zustand store for centralized state
  const store = useCodeChallengeStore();
  const [recentSubmissions, setRecentSubmissions] = useState<
    {
      id: string;
      title: string;
      language: string;
      status: string;
      testsPassed: number | null;
      totalTests: number | null;
      createdAt: string;
    }[]
  >([]);

  const loadRecentSubmissions = useCallback(async () => {
    try {
      const res = await fetch("/api/submissions?limit=6", {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.submissions)) {
          setRecentSubmissions(json.submissions);
        }
      }
    } catch {
      // Non-blocking
    }
  }, []);

  useEffect(() => {
    void loadRecentSubmissions();
  }, [loadRecentSubmissions]);

  // API request hooks for deduplication
  const { execute: executeAutoSave } = useAPIRequest(
    `code-save-${store.selectedLanguage}`,
    useCallback(async () => {
      // Don't save if there's no current challenge
      if (!store.currentChallenge?.id) {
        console.warn("Cannot save: No challenge loaded");
        return { success: false, message: "No challenge loaded" };
      }

      const response = await fetch("/api/code-challenge/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: store.code[store.selectedLanguage],
          language: store.selectedLanguage,
          challengeId: store.currentChallenge.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save code");
      }

      return response.json();
    }, [store.code, store.selectedLanguage, store.currentChallenge?.id]),
    { ttl: 60000, deduplicate: true }, // Cache for 1 minute
  );

  // Auto-save hook (debounced every 10 seconds)
  const { saveNow, hasUnsavedChanges } = useAutoSave(
    store.code[store.selectedLanguage],
    `code-${store.selectedLanguage}`,
    {
      debounceMs: 10000, // 10 seconds
      persistToServer: true,
      persistToLocalStorage: true,
      onSave: executeAutoSave,
      onError: (error) => {
        console.error("Auto-save failed:", error);
      },
    },
  );

  // Keyboard shortcuts with proper cleanup
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        runCode();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveNow();
        toast.success("Code saved manually");
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "F") {
        e.preventDefault();
        store.setIsFullscreen(!store.isFullscreen);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [saveNow, store.isFullscreen]);

  // Timer effect
  useEffect(() => {
    if (!store.isTimerRunning) return;

    const interval = setInterval(() => {
      store.incrementTimeElapsed();
    }, 1000);

    return () => clearInterval(interval);
  }, [store.isTimerRunning]);

  // Initialize on mount — load existing PostgreSQL challenges before forcing onboarding
  useEffect(() => {
    const onboardingCompleted = sessionStorage.getItem("onboarding_completed");
    const hasVisited = localStorage.getItem("code_challenge_visited");
    const onboardingCv = sessionStorage.getItem("onboarding_cv");
    const onboardingJob = sessionStorage.getItem("onboarding_job");
    const onboardingDifficulty = sessionStorage.getItem(
      "onboarding_difficulty",
    );

    if (onboardingCv && onboardingJob) {
      localStorage.setItem("code_challenge_visited", "true");
      store.setCvText(onboardingCv);
      store.setJobDescriptionText(onboardingJob);
      const difficulty = (onboardingDifficulty || "Medium") as
        | "Easy"
        | "Medium"
        | "Hard";
      if (onboardingDifficulty) {
        store.setSelectedDifficulty(difficulty);
      }
      generateChallengesWithRetry(onboardingCv, onboardingJob, difficulty);
      return;
    }

    // Check if the user already has challenges stored in PostgreSQL before redirecting to onboarding
    fetch("/api/challenges", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const list = Array.isArray(json?.challenges) ? json.challenges : [];
        if (list.length > 0) {
          localStorage.setItem("code_challenge_visited", "true");
          store.setGeneratedChallenges(list);
          if (!store.currentChallenge) {
            store.setCurrentChallenge(list[0]);
            store.setCurrentChallengeIndex(0);
          }
        } else if (!hasVisited && !onboardingCompleted) {
          router.replace("/code-challenge/onboarding");
        }
      })
      .catch(() => {
        if (!hasVisited && !onboardingCompleted) {
          router.replace("/code-challenge/onboarding");
        }
      });
  }, []);

  // Generate challenges with retry logic
  const generateChallengesWithRetry = async (
    cv: string,
    job: string,
    difficulty: string,
  ) => {
    const maxRetries = 2;
    let retries = 0;

    const attemptGenerate = async () => {
      try {
        toast.loading("Generating your personalized challenges...", {
          id: "auto-generate",
        });

        const result = await generateChallenges({
          cvData: cv,
          jobDescription: job,
          difficulty: (difficulty as "Easy" | "Medium" | "Hard") || "Medium",
          count: 3,
        });

        if (result?.challenges?.length > 0) {
          // Set the generated challenges in the store
          store.setGeneratedChallenges(result.challenges);
          store.setCurrentChallenge(result.challenges[0]);
          store.setCurrentChallengeIndex(0);

          // Initialize code for all languages with starter code
          const firstChallenge = result.challenges[0];
          if (firstChallenge.starterCode) {
            Object.entries(firstChallenge.starterCode).forEach(
              ([lang, code]) => {
                if (code) {
                  store.setCode(lang, code as string);
                }
              },
            );
          }

          toast.success("Challenges ready!", { id: "auto-generate" });
          // Clean up all onboarding data from sessionStorage
          sessionStorage.removeItem("onboarding_cv");
          sessionStorage.removeItem("onboarding_job");
          sessionStorage.removeItem("onboarding_difficulty");
          sessionStorage.removeItem("onboarding_completed");
        }
      } catch (error) {
        retries++;

        if (retries < maxRetries) {
          toast.loading(`⏳ Retrying... (${retries}/${maxRetries})`, {
            id: "auto-generate",
          });
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
          await attemptGenerate();
        } else {
          console.error("Challenge generation failed after retries:", error);
          toast.error("Failed to generate challenges. Please try again.", {
            id: "auto-generate",
          });
        }
      }
    };

    await attemptGenerate();
  };

  const runCode = async () => {
    if (!store.currentChallenge) {
      toast.error("No challenge loaded");
      return;
    }

    store.setIsRunning(true);
    store.clearConsoleOutput();
    store.addConsoleOutput("Executing code...");
    store.setShowConsole(true);

    try {
      const { results, metrics } = await executeCode(
        store.code[store.selectedLanguage],
        store.selectedLanguage,
        store.currentChallenge.testCases,
      );

      store.setTestResults(results);
      store.setExecutionMetrics({
        totalTime: metrics.totalTime,
        memoryUsed: metrics.memoryUsed,
        passedTests: metrics.passedTests,
        totalTests: metrics.totalTests,
      });

      store.clearConsoleOutput();
      store.addConsoleOutput(
        `✓ Execution completed in ${metrics.totalTime.toFixed(2)}ms`,
      );
      store.addConsoleOutput(
        `✓ Memory used: ${metrics.memoryUsed.toFixed(2)}KB`,
      );
      store.addConsoleOutput(
        `✓ Tests passed: ${metrics.passedTests}/${metrics.totalTests}`,
      );

      if (metrics.passedTests === metrics.totalTests) {
        toast.success("All tests passed!");
      } else {
        toast.warning(
          `${metrics.passedTests}/${metrics.totalTests} tests passed`,
        );
      }
    } catch (error) {
      store.addConsoleOutput(
        `✗ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      toast.error("Execution failed");
    } finally {
      store.setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!store.currentChallenge) {
      toast.error("No challenge loaded");
      return;
    }

    if (store.testResults.length === 0) {
      toast.error("Please run your code first");
      return;
    }

    try {
      await submitSolution({
        challengeId: store.currentChallenge.id,
        language: store.selectedLanguage,
        code: store.code[store.selectedLanguage],
        testResults: store.testResults,
        metrics: store.executionMetrics,
        timeElapsed: store.timeElapsed,
      });
      store.setHasUnsavedChanges(false);
      invalidateAPICache("code-submission");
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };

  const handleLanguageChange = (language: string) => {
    if (hasUnsavedChanges) {
      // Show warning before switching
      toast.warning("You have unsaved changes", {
        description: "Switching languages will save your current code.",
        action: {
          label: "Switch",
          onClick: () => {
            store.setSelectedLanguage(language);
            store.setCode(
              language,
              store.getCode(language) ||
                DEFAULT_CODE[language as keyof typeof DEFAULT_CODE] ||
                "",
            );
            invalidateAPICache(`code-save-${language}`);
          },
        },
      });
    } else {
      store.setSelectedLanguage(language);
      store.setCode(
        language,
        store.getCode(language) ||
          DEFAULT_CODE[language as keyof typeof DEFAULT_CODE] ||
          "",
      );
    }
  };

  const challenge = useMemo(
    () =>
      store.generatedChallenges.length > 0
        ? store.generatedChallenges[store.currentChallengeIndex]
        : store.currentChallenge,
    [
      store.generatedChallenges,
      store.currentChallengeIndex,
      store.currentChallenge,
    ],
  );

  const resetCode = () => {
    const starterCode =
      challenge?.starterCode?.[store.selectedLanguage] ||
      DEFAULT_CODE[store.selectedLanguage as keyof typeof DEFAULT_CODE];
    store.setCode(store.selectedLanguage, starterCode || "");
  };

  const isLoading = isChallengeLoading || isGenerating;

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"
          />
          <h2 className="text-2xl font-bold">
            {isGenerating ? "Generating challenges..." : "Loading..."}
          </h2>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground/50" />
            <div>
              <h2 className="text-xl font-bold mb-1">No Challenge Loaded</h2>
              <p className="text-sm text-muted-foreground">
                Configure your resume and target job to generate personalized
                coding challenges.
              </p>
            </div>
            <Button onClick={() => router.push("/code-challenge/onboarding")}>
              Generate Challenges
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header + Challenge Switcher */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight">
                {challenge.title}
              </h1>
              <Badge className="mt-2">{challenge.difficulty}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {store.timeElapsed > 0 && (
                <span className="tabular-nums">
                  Time: {Math.floor(store.timeElapsed / 60)}:
                  {String(store.timeElapsed % 60).padStart(2, "0")}
                </span>
              )}
              {hasUnsavedChanges && (
                <span className="text-xs font-medium text-primary">
                  Unsaved changes…
                </span>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => router.push("/code-challenge/onboarding")}
              >
                New Challenge Set
              </Button>
            </div>
          </div>

          {store.generatedChallenges.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              {store.generatedChallenges.map((item, idx) => {
                const active = item.id === challenge.id;
                return (
                  <Button
                    key={item.id}
                    type="button"
                    size="sm"
                    variant={active ? "default" : "outline"}
                    onClick={() => {
                      store.setCurrentChallenge(item);
                      store.setCurrentChallengeIndex(idx);
                    }}
                    className="h-8 text-xs"
                  >
                    {idx + 1}. {item.title}
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
          {/* Left: Problem */}
          <ProblemPanel challenge={challenge} />

          {/* Right: Editor */}
          <div className="space-y-4">
            <CodeEditorEnhanced
              code={store.code[store.selectedLanguage] || ""}
              onCodeChange={(code) =>
                store.setCode(store.selectedLanguage, code)
              }
              selectedLanguage={store.selectedLanguage}
              onLanguageChange={handleLanguageChange}
              onRun={runCode}
              onReset={resetCode}
              isRunning={store.isRunning || isExecuting}
              hasUnsavedChanges={hasUnsavedChanges}
              showConsole={store.showConsole}
              onToggleConsole={store.setShowConsole}
              consoleOutput={store.consoleOutput}
              executionMetrics={store.executionMetrics}
            />
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              variant="default"
              className="w-full"
            >
              {isSubmitting ? "Submitting..." : "Submit Solution"}
            </Button>
          </div>
        </div>

        {/* Results */}
        {store.testResults.length > 0 && (
          <TestResultsPanel
            testResults={store.testResults}
            metrics={store.executionMetrics}
          />
        )}

        {/* Recent PostgreSQL Submissions */}
        {recentSubmissions.length > 0 && (
          <Card className="mt-6 shadow-none">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-base font-semibold text-foreground">
                  Recent Submissions ({recentSubmissions.length})
                </h2>
                <span className="text-xs text-muted-foreground">
                  Persisted in PostgreSQL
                </span>
              </div>
              <div className="divide-y divide-border/70">
                {recentSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-xs first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {sub.title}
                      </p>
                      <p className="text-muted-foreground tabular-nums">
                        {sub.language} ·{" "}
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {sub.totalTests != null && (
                        <span className="text-muted-foreground tabular-nums">
                          {sub.testsPassed ?? 0}/{sub.totalTests} tests
                        </span>
                      )}
                      <Badge
                        variant={
                          sub.status === "passed" ? "default" : "secondary"
                        }
                        className="capitalize text-[11px]"
                      >
                        {sub.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
