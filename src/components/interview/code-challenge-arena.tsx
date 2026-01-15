"use client";

import { useState, useEffect } from "react";
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
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  Code,
  FileText,
  CheckCircle2,
  Clock,
  Zap,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Monaco Editor (since we have it in dependencies)
interface CodeEditorProps {
  language: string;
  value: string;
  onChange?: (value: string) => void;
  theme?: string;
  className?: string;
}

function CodeEditor({
  language,
  value,
  onChange,
  theme = "vs-dark",
  className,
}: CodeEditorProps) {
  return (
    <div
      className={cn("border rounded-lg overflow-hidden bg-gray-900", className)}
    >
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <Badge variant="outline" className="text-xs">
            {language}
          </Badge>
        </div>
        <div className="text-xs text-gray-400">Line 1, Col 1</div>
      </div>
      <div className="p-4 min-h-[300px] font-mono text-sm text-gray-100">
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full h-full bg-transparent border-none outline-none resize-none"
          placeholder={`// Write your ${language} code here...`}
          spellCheck={false}
        />
      </div>
    </div>
  );
}

interface CodingChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  starterCode: Record<string, string>;
  testCases: Array<{
    input: string;
    expectedOutput: string;
    hidden?: boolean;
  }>;
}

interface CodeChallengeArenaProps {
  challenge?: CodingChallenge;
  onSubmit?: (code: string, language: string) => void;
  onTest?: (code: string, language: string) => void;
  className?: string;
}

export function CodeChallengeArena({
  challenge,
  onSubmit,
  onTest,
  className,
}: CodeChallengeArenaProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<Array<{
    passed: boolean;
    input: string;
    expected: string;
    actual: string;
  }> | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(
    challenge?.timeLimit || 3600,
  );
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "typescript", label: "TypeScript" },
  ];

  useEffect(() => {
    if (challenge && challenge.starterCode[selectedLanguage]) {
      setCode(challenge.starterCode[selectedLanguage]);
    }
  }, [challenge, selectedLanguage]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600 bg-green-100 dark:bg-green-900/20";
      case "medium":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
      case "hard":
        return "text-red-600 bg-red-100 dark:bg-red-900/20";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setTestResults(null);

    // Simulate test execution
    setTimeout(() => {
      if (challenge) {
        const results = challenge.testCases
          .slice(0, 3)
          .map((testCase, index) => ({
            passed: Math.random() > 0.3, // Random results for demo
            input: testCase.input,
            expected: testCase.expectedOutput,
            actual:
              Math.random() > 0.5 ? testCase.expectedOutput : "Wrong output",
          }));
        setTestResults(results);
      }
      setIsRunning(false);
    }, 2000);

    onTest?.(code, selectedLanguage);
  };

  const handleSubmit = () => {
    onSubmit?.(code, selectedLanguage);
  };

  if (!challenge) {
    return (
      <Card className={cn("h-full", className)}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <Code className="w-12 h-12 mx-auto mb-4" />
            <p>No challenge selected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6 h-full", className)}
    >
      {/* Problem Description */}
      <Card className="flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              {challenge.title}
            </CardTitle>
            <Badge
              className={cn(
                "font-medium",
                getDifficultyColor(challenge.difficulty),
              )}
            >
              {challenge.difficulty.toUpperCase()}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatTime(timeRemaining)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
            >
              {isTimerRunning ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Problem Description</h3>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {challenge.description}
            </p>
          </div>

          {/* Examples */}
          <div>
            <h3 className="font-semibold mb-3">Examples</h3>
            <div className="space-y-3">
              {challenge.examples.map((example, index) => (
                <div key={index} className="bg-muted/50 rounded-lg p-3">
                  <div className="text-sm">
                    <div className="mb-2">
                      <span className="font-medium">Input:</span>
                      <code className="ml-2 bg-muted px-2 py-1 rounded">
                        {example.input}
                      </code>
                    </div>
                    <div className="mb-2">
                      <span className="font-medium">Output:</span>
                      <code className="ml-2 bg-muted px-2 py-1 rounded">
                        {example.output}
                      </code>
                    </div>
                    {example.explanation && (
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Explanation:</span>{" "}
                        {example.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Constraints */}
          <div>
            <h3 className="font-semibold mb-2">Constraints</h3>
            <ul className="text-sm space-y-1">
              {challenge.constraints.map((constraint, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>{constraint}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Code Editor */}
      <Card className="flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Select
                value={selectedLanguage}
                onValueChange={setSelectedLanguage}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCode(challenge.starterCode[selectedLanguage] || "")
                }
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRun}
                disabled={isRunning}
              >
                {isRunning ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
                  />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Run Tests
              </Button>
              <Button onClick={handleSubmit}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Submit
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-4">
          <CodeEditor
            language={selectedLanguage}
            value={code}
            onChange={setCode}
            className="flex-1"
          />

          {/* Test Results */}
          <AnimatePresence>
            {testResults && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <h4 className="font-semibold text-sm">Test Results</h4>
                <div className="space-y-2 max-h-32 overflow-auto">
                  {testResults.map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded text-xs",
                        result.passed
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
                      )}
                    >
                      <CheckCircle2
                        className={cn(
                          "w-4 h-4",
                          result.passed ? "text-green-600" : "text-red-600",
                        )}
                      />
                      <span>
                        Test Case {index + 1}:{" "}
                        {result.passed ? "Passed" : "Failed"}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
