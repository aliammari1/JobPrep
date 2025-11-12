"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

const sampleChallenge: Challenge = {
  id: "1",
  title: "Two Sum Problem",
  difficulty: "Easy",
  description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
  constraints: [
    "2 ≤ nums.length ≤ 10⁴",
    "-10⁹ ≤ nums[i] ≤ 10⁹",
    "-10⁹ ≤ target ≤ 10⁹",
    "Only one valid answer exists.",
  ],
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "[1,2]",
      explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
    },
  ],
  testCases: [
    { id: "1", input: "[2,7,11,15], 9", expectedOutput: "[0,1]" },
    { id: "2", input: "[3,2,4], 6", expectedOutput: "[1,2]" },
    { id: "3", input: "[3,3], 6", expectedOutput: "[0,1]" },
    { id: "4", input: "[1,2,3,4,5], 8", expectedOutput: "[2,4]" },
    { id: "5", input: "[-1,-2,-3,-4,-5], -8", expectedOutput: "[2,4]" },
  ],
  timeLimit: 1000,
  memoryLimit: 256,
};

const languages = [
  { value: "javascript", label: "JavaScript", extension: "js" },
  { value: "python", label: "Python", extension: "py" },
  { value: "java", label: "Java", extension: "java" },
  { value: "cpp", label: "C++", extension: "cpp" },
  { value: "typescript", label: "TypeScript", extension: "ts" },
  { value: "go", label: "Go", extension: "go" },
];

const defaultCode = {
  javascript: `function twoSum(nums, target) {
    // Your solution here
    
}`,
  python: `def two_sum(nums, target):
    # Your solution here
    pass`,
  java: `public class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your solution here
        
    }
}`,
  cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your solution here
        
    }
};`,
  typescript: `function twoSum(nums: number[], target: number): number[] {
    // Your solution here
    
}`,
  go: `func twoSum(nums []int, target int) []int {
    // Your solution here
    
}`,
};

export default function CodeChallengeArena() {
  const { executeCode, isExecuting } = useCodeExecution();
  const { currentChallenge, fetchChallenge, isLoading: isChallengeLoading } =
    useChallenges();
  const { submitSolution, isSubmitting } = useSubmissions();
  const { generateChallenges, isGenerating, generatedChallenges } = useGenerateChallenges();
  const { theme } = useTheme();
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(defaultCode.javascript);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestCase[]>([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [currentTab, setCurrentTab] = useState("description");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showLanguageChangeDialog, setShowLanguageChangeDialog] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [cvText, setCvText] = useState("");
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [executionMetrics, setExecutionMetrics] = useState({
    totalTime: 0,
    memoryUsed: 0,
    passedTests: 0,
    totalTests: 5,
  });

  // Check for onboarding data on mount
  useEffect(() => {
    const onboardingCompleted = sessionStorage.getItem("onboarding_completed");
    const hasVisited = localStorage.getItem("code_challenge_visited");
    
    // Only redirect if never visited before and no onboarding data
    if (!hasVisited && !onboardingCompleted) {
      window.location.href = "/code-challenge/onboarding";
      return;
    }

    // Mark as visited
    localStorage.setItem("code_challenge_visited", "true");

    // Load onboarding data if available
    const onboardingCv = sessionStorage.getItem("onboarding_cv");
    const onboardingJob = sessionStorage.getItem("onboarding_job");
    const onboardingDifficulty = sessionStorage.getItem("onboarding_difficulty");

    if (onboardingCv && onboardingJob) {
      setCvText(onboardingCv);
      setJobDescriptionText(onboardingJob);
      if (onboardingDifficulty) {
        setSelectedDifficulty(onboardingDifficulty as "Easy" | "Medium" | "Hard");
      }

      // Auto-generate challenges
      toast.loading("🤖 Generating your personalized challenges...", {
        id: "auto-generate",
      });

      generateChallenges({
        cvData: onboardingCv,
        jobDescription: onboardingJob,
        difficulty: (onboardingDifficulty as "Easy" | "Medium" | "Hard") || "Medium",
        count: 3,
      }).then(() => {
        toast.success("✨ Challenges ready!", { id: "auto-generate" });
        // Clear onboarding data after generating
        sessionStorage.removeItem("onboarding_cv");
        sessionStorage.removeItem("onboarding_job");
        sessionStorage.removeItem("onboarding_difficulty");
      }).catch(() => {
        toast.error("Failed to generate challenges", { id: "auto-generate" });
        fetchChallenge("1"); // Fallback to default challenge
      });
    } else {
      fetchChallenge("1"); // Load default challenge
    }
    
    // Show welcome tip
    setTimeout(() => {
      toast.info("Pro tip: Press Ctrl+Enter to run code", {
        description: "Click the Shortcuts button to see all keyboard shortcuts",
        duration: 5000,
      });
    }, 1000);
  }, []);

  // Load code from localStorage
  useEffect(() => {
    const savedCode = localStorage.getItem(`code_${selectedLanguage}_1`);
    if (savedCode) {
      setCode(savedCode);
      const savedTime = localStorage.getItem(`lastSaved_${selectedLanguage}_1`);
      if (savedTime) {
        setLastSaved(new Date(savedTime));
      }
      toast.success("Code restored from autosave", {
        description: "Your previous work has been loaded",
      });
    }
  }, []);

  // Update challenge data when loaded
  useEffect(() => {
    if (currentChallenge) {
      const savedCode = localStorage.getItem(`code_${selectedLanguage}_1`);
      if (!savedCode) {
        const starterCode =
          currentChallenge.starterCode?.[selectedLanguage] ||
          defaultCode[selectedLanguage as keyof typeof defaultCode];
        setCode(starterCode);
      }
      setHasUnsavedChanges(false);
    }
  }, [currentChallenge]);

  // Auto-save code
  const autoSaveCode = useCallback(() => {
    if (code && code.trim().length > 0) {
      localStorage.setItem(`code_${selectedLanguage}_1`, code);
      localStorage.setItem(`lastSaved_${selectedLanguage}_1`, new Date().toISOString());
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    }
  }, [code, selectedLanguage]);

  // Auto-save on code change (debounced)
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      autoSaveCode();
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [code, autoSaveCode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter: Run code
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        runCode();
      }
      // Ctrl/Cmd + S: Manual save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        autoSaveCode();
        toast.success("Code saved manually");
      }
      // Ctrl/Cmd + Shift + F: Toggle fullscreen
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "F") {
        e.preventDefault();
        setIsFullscreen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [code, autoSaveCode]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Start timer on first code change
  useEffect(() => {
    const defaultCodeForLang =
      currentChallenge?.starterCode?.[selectedLanguage] ||
      defaultCode[selectedLanguage as keyof typeof defaultCode];

    if (code !== defaultCodeForLang && !isTimerRunning) {
      setIsTimerRunning(true);
      setHasUnsavedChanges(true);
    }
  }, [code, selectedLanguage, isTimerRunning, currentChallenge]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleLanguageChange = (language: string) => {
    if (hasUnsavedChanges) {
      setPendingLanguage(language);
      setShowLanguageChangeDialog(true);
    } else {
      confirmLanguageChange(language);
    }
  };

  const confirmLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    const newCode =
      currentChallenge?.starterCode?.[language] ||
      defaultCode[language as keyof typeof defaultCode];
    setCode(newCode);
    setTestResults([]);
    setHasUnsavedChanges(false);
    setShowLanguageChangeDialog(false);
    setPendingLanguage(null);
  };

  const runCode = async () => {
    if (!currentChallenge) {
      toast.error("No challenge loaded");
      return;
    }

    setIsRunning(true);
    setTestResults([]); // Clear previous results
    setConsoleOutput(["Executing code..."]);
    setShowConsole(true);

    try {
      const { results, metrics } = await executeCode(
        code,
        selectedLanguage,
        currentChallenge.testCases
      );

      setTestResults(results);
      setExecutionMetrics({
        totalTime: metrics.totalTime,
        memoryUsed: metrics.memoryUsed,
        passedTests: metrics.passedTests,
        totalTests: metrics.totalTests,
      });

      // Update console
      setConsoleOutput([
        `✓ Execution completed in ${metrics.totalTime.toFixed(2)}ms`,
        `✓ Memory used: ${metrics.memoryUsed.toFixed(2)}KB`,
        `✓ Tests passed: ${metrics.passedTests}/${metrics.totalTests}`,
      ]);

      // Show success/failure toast
      if (metrics.passedTests === metrics.totalTests) {
        toast.success("All tests passed!", {
          description: "Great job! Your solution is correct.",
        });
      } else {
        toast.warning(`${metrics.passedTests}/${metrics.totalTests} tests passed`, {
          description: "Some test cases failed. Check the results below.",
        });
      }
    } catch (error) {
      setConsoleOutput([
        `✗ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      ]);
      toast.error("Execution failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentChallenge) {
      toast.error("No challenge loaded");
      return;
    }

    if (testResults.length === 0) {
      toast.error("Please run your code first");
      return;
    }

    try {
      await submitSolution({
        challengeId: currentChallenge.id,
        language: selectedLanguage,
        code,
        testResults,
        metrics: executionMetrics,
        timeElapsed,
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const resetCode = () => {
    if (hasUnsavedChanges) {
      setShowResetDialog(true);
    } else {
      confirmReset();
    }
  };

  const confirmReset = () => {
    const defaultCodeForLang =
      currentChallenge?.starterCode?.[selectedLanguage] ||
      defaultCode[selectedLanguage as keyof typeof defaultCode];
    setCode(defaultCodeForLang);
    setTestResults([]);
    setTimeElapsed(0);
    setIsTimerRunning(false);
    setHasUnsavedChanges(false);
    setExecutionMetrics({
      totalTime: 0,
      memoryUsed: 0,
      passedTests: 0,
      totalTests: currentChallenge?.testCases.length || 5,
    });
    setShowResetDialog(false);
    toast.success("Code reset to starter template");
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-600 bg-green-100 dark:bg-green-900/20";
      case "Medium":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
      case "Hard":
        return "text-red-600 bg-red-100 dark:bg-red-900/20";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
    }
  };

  const getSuccessRate = () => {
    if (testResults.length === 0) return 0;
    return (executionMetrics.passedTests / executionMetrics.totalTests) * 100;
  };

  // Handle AI generation of challenges
  const handleGenerateChallenges = async () => {
    if (!cvText.trim() || !jobDescriptionText.trim()) {
      toast.error("Please provide both CV and job description");
      return;
    }

    try {
      const result = await generateChallenges({
        cvData: {
          text: cvText,
          skills: [], // Will be extracted by AI
        },
        jobDescription: jobDescriptionText,
        difficulty: selectedDifficulty,
        count: 3,
      });

      if (result && result.challenges.length > 0) {
        setCurrentChallengeIndex(0);
        setShowGenerateDialog(false);
        
        // Load first generated challenge
        const firstChallenge = result.challenges[0];
        const starterCodeForLang = firstChallenge.starterCode?.[selectedLanguage] ||
          defaultCode[selectedLanguage as keyof typeof defaultCode];
        setCode(starterCodeForLang);
        setTestResults([]);
        setHasUnsavedChanges(false);
        
        toast.success(`Loaded: ${firstChallenge.title}`, {
          description: `${result.challenges.length} personalized challenges ready!`,
        });
      }
    } catch (error) {
      // Error is handled in the hook
      console.error("Failed to generate challenges:", error);
    }
  };

  // Navigate between generated challenges
  const handleNextChallenge = () => {
    if (currentChallengeIndex < generatedChallenges.length - 1) {
      const nextIndex = currentChallengeIndex + 1;
      setCurrentChallengeIndex(nextIndex);
      const nextChallenge = generatedChallenges[nextIndex];
      const starterCodeForLang = nextChallenge.starterCode?.[selectedLanguage] ||
        defaultCode[selectedLanguage as keyof typeof defaultCode];
      setCode(starterCodeForLang);
      setTestResults([]);
      setHasUnsavedChanges(false);
      setTimeElapsed(0);
      toast.info(`Challenge ${nextIndex + 1}/${generatedChallenges.length}`, {
        description: nextChallenge.title,
      });
    }
  };

  const handlePreviousChallenge = () => {
    if (currentChallengeIndex > 0) {
      const prevIndex = currentChallengeIndex - 1;
      setCurrentChallengeIndex(prevIndex);
      const prevChallenge = generatedChallenges[prevIndex];
      const starterCodeForLang = prevChallenge.starterCode?.[selectedLanguage] ||
        defaultCode[selectedLanguage as keyof typeof defaultCode];
      setCode(starterCodeForLang);
      setTestResults([]);
      setHasUnsavedChanges(false);
      setTimeElapsed(0);
      toast.info(`Challenge ${prevIndex + 1}/${generatedChallenges.length}`, {
        description: prevChallenge.title,
      });
    }
  };

  // Use current challenge or fallback to sample
  const challenge = generatedChallenges.length > 0 
    ? generatedChallenges[currentChallengeIndex]
    : currentChallenge;

  // Show loading state if:
  // 1. First time visiting (checking onboarding)
  // 2. Generating challenges
  // 3. No challenges available
  const isWaitingForChallenges = isGenerating || (!generatedChallenges.length && !currentChallenge && !isChallengeLoading);

  if (isChallengeLoading || isWaitingForChallenges) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-muted/10">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto"
          />
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {isGenerating ? "🤖 Generating Your Challenges" : "Preparing Your Session"}
            </h2>
            <p className="text-muted-foreground max-w-md">
              {isGenerating 
                ? "Our AI is creating personalized coding challenges based on your CV and job description..."
                : "Please complete the onboarding to get started"}
            </p>
          </div>
          {isGenerating && (
            <div className="mt-6">
              <Badge variant="secondary" className="animate-pulse">
                This may take a moment...
              </Badge>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-muted/10">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-muted-foreground/50 mx-auto" />
          <div>
            <h2 className="text-2xl font-bold mb-2">No Challenge Available</h2>
            <p className="text-muted-foreground max-w-md">
              Please generate challenges first or refresh the page
            </p>
          </div>
          <Button onClick={() => setShowGenerateDialog(true)}>
            Generate Challenges
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-muted/10 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent" />
        <div className="container mx-auto p-6 space-y-8">
          {/* Header */}
          <AnimatedContainer>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-b from-foreground to-muted-foreground/70 bg-clip-text text-transparent">
                  Code Challenge Arena
                </h1>
                <p className="text-muted-foreground mt-2">
                  {generatedChallenges.length > 0 
                    ? `AI-Generated • Challenge ${currentChallengeIndex + 1}/${generatedChallenges.length}` 
                    : "Real-time coding challenges with instant feedback"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowGenerateDialog(true)}
                  className="hidden md:flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <Brain className="w-4 h-4" />
                      </motion.div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      AI Generate
                    </>
                  )}
                </Button>
                {generatedChallenges.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousChallenge}
                      disabled={currentChallengeIndex === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextChallenge}
                      disabled={currentChallengeIndex === generatedChallenges.length - 1}
                    >
                      Next
                    </Button>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowKeyboardShortcuts(true)}
                  className="hidden md:flex items-center gap-2"
                >
                  <Keyboard className="w-4 h-4" />
                  Shortcuts
                </Button>
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-primary">
                    {formatTime(timeElapsed)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Time Elapsed
                  </div>
                </div>
                <Badge
                  variant={isTimerRunning ? "destructive" : "secondary"}
                  className={cn(isTimerRunning && "animate-pulse")}
                >
                  {isTimerRunning ? "● ACTIVE" : "● READY"}
                </Badge>
              </div>
            </div>
          </AnimatedContainer>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Problem Description - Left Column (30%) */}
          <div className="space-y-6 xl:col-span-1">
            {/* Challenge Info */}
            <AnimatedContainer delay={0.1}>
              <ProblemPanel
                challenge={challenge}
                isLoading={false}
                currentIndex={currentChallengeIndex}
                totalChallenges={generatedChallenges.length > 0 ? generatedChallenges.length : 1}
              />
            </AnimatedContainer>

            {/* Test Results */}
            <AnimatedContainer delay={0.2}>
              <TestResultsPanel
                testResults={testResults}
                metrics={executionMetrics}
                isRunning={isRunning}
              />
            </AnimatedContainer>
          </div>

          {/* Code Editor - Center/Right Column (70%) */}
          <div className="space-y-6 xl:col-span-2">
            {/* Editor Controls */}
            <AnimatedContainer delay={0.3}>
              <CodeEditorEnhanced
                code={code}
                onCodeChange={(newCode) => {
                  setCode(newCode);
                  setHasUnsavedChanges(true);
                }}
                selectedLanguage={selectedLanguage}
                onLanguageChange={handleLanguageChange}
                onRun={runCode}
                onReset={resetCode}
                isRunning={isRunning || isExecuting}
                lastSaved={lastSaved}
                hasUnsavedChanges={hasUnsavedChanges}
                showConsole={showConsole}
                onToggleConsole={setShowConsole}
                consoleOutput={consoleOutput}
                executionMetrics={executionMetrics}
                timeElapsed={timeElapsed}
                successRate={getSuccessRate()}
              />
            </AnimatedContainer>

            {/* Performance Metrics */}
            {testResults.length > 0 && (
              <AnimatedContainer delay={0.4}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Success Rate</span>
                          <span className="font-medium">
                            {getSuccessRate().toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={getSuccessRate()} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Avg. Execution Time</span>
                          <span className="font-medium">
                            {executionMetrics.totalTime.toFixed(1)}ms
                          </span>
                        </div>
                        <Progress
                          value={
                            (executionMetrics.totalTime /
                              challenge.timeLimit) *
                            100
                          }
                          className="h-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Memory Usage</span>
                          <span className="font-medium">
                            {executionMetrics.memoryUsed.toFixed(1)}MB
                          </span>
                        </div>
                        <Progress
                          value={
                            (executionMetrics.memoryUsed /
                              challenge.memoryLimit) *
                            100
                          }
                          className="h-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Time Efficiency</span>
                          <span className="font-medium">
                            {executionMetrics.totalTime <
                            challenge.timeLimit * 0.5
                              ? "Excellent"
                              : executionMetrics.totalTime <
                                challenge.timeLimit * 0.8
                              ? "Good"
                              : "Needs Improvement"}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <div
                              key={star}
                              className={cn(
                                "w-3 h-3 rounded-full",
                                star <=
                                  (executionMetrics.totalTime <
                                  challenge.timeLimit * 0.5
                                    ? 5
                                    : executionMetrics.totalTime <
                                      challenge.timeLimit * 0.8
                                    ? 3
                                    : 1)
                                  ? "bg-yellow-400"
                                  : "bg-gray-200 dark:bg-gray-700"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {getSuccessRate() === 100 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                      >
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                          <Trophy className="w-5 h-5" />
                          <span className="font-medium">
                            Congratulations! All tests passed!
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </AnimatedContainer>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Confirmation Dialogs */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Code?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset your code to the starter template. All your
              changes will be lost. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReset}>
              Reset Code
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showLanguageChangeDialog}
        onOpenChange={setShowLanguageChangeDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Language?</AlertDialogTitle>
            <AlertDialogDescription>
              Changing the language will reset your code to the starter template
              for {pendingLanguage}. Your current changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingLanguage(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                pendingLanguage && confirmLanguageChange(pendingLanguage)
              }
            >
              Change Language
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Keyboard Shortcuts Dialog */}
      <AlertDialog open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Keyboard Shortcuts
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 pt-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">Run Code</div>
                  <div className="text-right">
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl</kbd> + <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd>
                  </div>
                  
                  <div className="font-medium">Save Code</div>
                  <div className="text-right">
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl</kbd> + <kbd className="px-2 py-1 bg-muted rounded text-xs">S</kbd>
                  </div>
                  
                  <div className="font-medium">Toggle Fullscreen</div>
                  <div className="text-right">
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl</kbd> + <kbd className="px-2 py-1 bg-muted rounded text-xs">Shift</kbd> + <kbd className="px-2 py-1 bg-muted rounded text-xs">F</kbd>
                  </div>
                  
                  <div className="font-medium">Format Code</div>
                  <div className="text-right">
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">Shift</kbd> + <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt</kbd> + <kbd className="px-2 py-1 bg-muted rounded text-xs">F</kbd>
                  </div>
                  
                  <div className="font-medium">Comment Line</div>
                  <div className="text-right">
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl</kbd> + <kbd className="px-2 py-1 bg-muted rounded text-xs">/</kbd>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Use <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Cmd</kbd> instead of <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl</kbd> on Mac
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowKeyboardShortcuts(false)}>
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AI Generate Challenges Dialog */}
      <AlertDialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <AlertDialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-2xl">
              <Brain className="w-6 h-6 text-purple-600" />
              Generate AI-Powered Challenges
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Our AI will analyze your CV and job description to create personalized coding challenges
              that match your skills and the position requirements.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-6 py-4">
            {/* CV Input */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 font-medium text-sm">
                <FileText className="w-4 h-4 text-blue-600" />
                Your CV/Resume
              </label>
              <textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder="Paste your CV content here... Include your experience, skills, education, and projects."
                className="w-full h-40 px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <p className="text-xs text-muted-foreground">
                💡 Tip: Include technical skills, programming languages, frameworks, and key achievements
              </p>
            </div>

            {/* Job Description Input */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 font-medium text-sm">
                <Briefcase className="w-4 h-4 text-green-600" />
                Job Description
              </label>
              <textarea
                value={jobDescriptionText}
                onChange={(e) => setJobDescriptionText(e.target.value)}
                placeholder="Paste the job description here... Include required skills, responsibilities, and qualifications."
                className="w-full h-40 px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <p className="text-xs text-muted-foreground">
                💡 Tip: The more detailed the job description, the more relevant the challenges
              </p>
            </div>

            {/* Difficulty Selection */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 font-medium text-sm">
                <Target className="w-4 h-4 text-orange-600" />
                Challenge Difficulty
              </label>
              <Select
                value={selectedDifficulty}
                onValueChange={(value: "Easy" | "Medium" | "Hard") => setSelectedDifficulty(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy - Fundamental concepts</SelectItem>
                  <SelectItem value="Medium">Medium - Practical problems</SelectItem>
                  <SelectItem value="Hard">Hard - Advanced algorithms</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">What you'll get:</h4>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li>✅ 3 personalized coding challenges</li>
                    <li>✅ Tailored to your skill level and job requirements</li>
                    <li>✅ Real-world scenarios relevant to the position</li>
                    <li>✅ Complete with test cases, hints, and starter code</li>
                    <li>✅ Support for 6 programming languages</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowGenerateDialog(false)} disabled={isGenerating}>
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={handleGenerateChallenges}
              disabled={isGenerating || !cvText.trim() || !jobDescriptionText.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="mr-2"
                  >
                    <Brain className="w-4 h-4" />
                  </motion.div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Challenges
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
