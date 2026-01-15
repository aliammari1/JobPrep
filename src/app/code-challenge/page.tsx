"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCodeExecution } from "@/hooks/use-code-execution";
import { useChallenges } from "@/hooks/use-challenges";
import { useSubmissions } from "@/hooks/use-submissions";
import { useGenerateChallenges } from "@/hooks/use-generate-challenges";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useAPIRequest, invalidateAPICache } from "@/hooks/use-api-request";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import {
  Trophy,
  Target,
  Keyboard,
  Sparkles,
  Brain,
  FileText,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AnimatedContainer,
  StaggeredContainer,
  StaggeredItem,
} from "@/components/ui/animated";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CodeEditorEnhanced } from "@/components/code-challenge/CodeEditorEnhanced";
import { ProblemPanel } from "@/components/code-challenge/ProblemPanel";
import { TestResultsPanel } from "@/components/code-challenge/TestResultsPanel";
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

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "typescript", label: "TypeScript" },
  { value: "go", label: "Go" },
];

/**
 * Refactored Code Challenge Arena with optimized state management
 * - Zustand for centralized state
 * - API request deduplication
 * - Server-side auto-save every 10 seconds
 * - Proper keyboard event cleanup
 * - Single-source-of-truth for code and state
 */
export default function CodeChallengeArena() {
  const { executeCode, isExecuting } = useCodeExecution();
  const {
    currentChallenge,
    fetchChallenge,
    isLoading: isChallengeLoading,
  } = useChallenges();
  const { submitSolution, isSubmitting } = useSubmissions();
  const { generateChallenges, isGenerating, generatedChallenges } =
    useGenerateChallenges();
  const { theme } = useTheme();

  // Use Zustand store for centralized state
  const store = useCodeChallengeStore();

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

  // Initialize on mount
  useEffect(() => {
    const onboardingCompleted = sessionStorage.getItem("onboarding_completed");
    const hasVisited = localStorage.getItem("code_challenge_visited");

    if (!hasVisited && !onboardingCompleted) {
      window.location.href = "/code-challenge/onboarding";
      return;
    }

    localStorage.setItem("code_challenge_visited", "true");

    // Load onboarding data
    const onboardingCv = sessionStorage.getItem("onboarding_cv");
    const onboardingJob = sessionStorage.getItem("onboarding_job");
    const onboardingDifficulty = sessionStorage.getItem(
      "onboarding_difficulty",
    );

    if (onboardingCv && onboardingJob) {
      store.setCvText(onboardingCv);
      store.setJobDescriptionText(onboardingJob);
      const difficulty = (onboardingDifficulty || "Medium") as
        | "Easy"
        | "Medium"
        | "Hard";
      if (onboardingDifficulty) {
        store.setSelectedDifficulty(difficulty);
      }

      // Auto-generate with error handling and retry
      generateChallengesWithRetry(onboardingCv, onboardingJob, difficulty);
    }
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
        toast.loading("🤖 Generating your personalized challenges...", {
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

          toast.success("✨ Challenges ready!", { id: "auto-generate" });
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
        toast.success("All tests passed! 🎉");
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

  const isLoading = isChallengeLoading || isGenerating;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-primary/5 to-muted/10">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto"
          />
          <h2 className="text-2xl font-bold">
            {isGenerating ? "🤖 Generating Challenges" : "Loading..."}
          </h2>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-xl font-bold mb-2">No Challenge Available</h2>
            <Button onClick={() => {}}>Generate Challenges</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{challenge.title}</h1>
            <Badge className="mt-2">{challenge.difficulty}</Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {store.timeElapsed > 0 && (
              <p>
                Time: {Math.floor(store.timeElapsed / 60)}:
                {String(store.timeElapsed % 60).padStart(2, "0")}
              </p>
            )}
            {hasUnsavedChanges && (
              <p className="text-yellow-600">Unsaved changes...</p>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Left: Problem */}
          <ProblemPanel challenge={challenge} />

          {/* Right: Editor */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Code Editor</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={store.selectedLanguage}
                  onValueChange={handleLanguageChange}
                >
                  <SelectTrigger className="mb-4">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <CodeEditorEnhanced
                  code={store.code[store.selectedLanguage] || ""}
                  onCodeChange={(code) =>
                    store.setCode(store.selectedLanguage, code)
                  }
                  selectedLanguage={store.selectedLanguage}
                  onLanguageChange={handleLanguageChange}
                  onRun={runCode}
                  isRunning={store.isRunning}
                  hasUnsavedChanges={hasUnsavedChanges}
                  executionMetrics={store.executionMetrics}
                />

                <div className="mt-4 space-y-2">
                  <Button
                    onClick={runCode}
                    disabled={isExecuting}
                    className="w-full"
                  >
                    {isExecuting ? "Running..." : "Run Code (Ctrl+Enter)"}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    variant="default"
                    className="w-full"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Solution"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Results */}
        {store.testResults.length > 0 && (
          <TestResultsPanel
            testResults={store.testResults}
            metrics={store.executionMetrics}
          />
        )}
      </div>
    </div>
  );
}
