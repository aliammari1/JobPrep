"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Play,
  Pause,
  RotateCcw,
  Code2,
  Terminal,
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  Zap,
  FileCode,
  Bug,
  TestTube,
  Cpu,
  MemoryStick,
  Timer,
  Target,
  Lightbulb,
  Eye,
  EyeOff,
  Settings,
  Download,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AnimatedContainer,
  StaggeredContainer,
  StaggeredItem,
} from "@/components/ui/animated";

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
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(defaultCode.javascript);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestCase[]>([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [currentTab, setCurrentTab] = useState("description");
  const [executionMetrics, setExecutionMetrics] = useState({
    totalTime: 0,
    memoryUsed: 0,
    passedTests: 0,
    totalTests: 5,
  });

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
    if (
      code !== defaultCode[selectedLanguage as keyof typeof defaultCode] &&
      !isTimerRunning
    ) {
      setIsTimerRunning(true);
    }
  }, [code, selectedLanguage, isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    setCode(defaultCode[language as keyof typeof defaultCode]);
    setTestResults([]);
  };

  const runCode = async () => {
    setIsRunning(true);

    // Simulate test execution
    const results: TestCase[] = [];

    for (let i = 0; i < sampleChallenge.testCases.length; i++) {
      const testCase = sampleChallenge.testCases[i];

      // Simulate execution delay
      await new Promise((resolve) =>
        setTimeout(resolve, 200 + Math.random() * 300)
      );

      // Simulate test result (randomly pass/fail for demo)
      const passed = Math.random() > 0.3; // 70% pass rate for demo
      const executionTime = Math.random() * 100 + 10;

      const result: TestCase = {
        ...testCase,
        actualOutput: passed ? testCase.expectedOutput : "[1,0]",
        passed,
        executionTime,
      };

      results.push(result);
      setTestResults([...results]);
    }

    // Update metrics
    const passedCount = results.filter((r) => r.passed).length;
    const avgTime =
      results.reduce((sum, r) => sum + (r.executionTime || 0), 0) /
      results.length;

    setExecutionMetrics({
      totalTime: avgTime,
      memoryUsed: Math.random() * 50 + 20,
      passedTests: passedCount,
      totalTests: results.length,
    });

    setIsRunning(false);
  };

  const resetCode = () => {
    setCode(defaultCode[selectedLanguage as keyof typeof defaultCode]);
    setTestResults([]);
    setTimeElapsed(0);
    setIsTimerRunning(false);
    setExecutionMetrics({
      totalTime: 0,
      memoryUsed: 0,
      passedTests: 0,
      totalTests: 5,
    });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <AnimatedContainer>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Code Challenge Arena
              </h1>
              <p className="text-muted-foreground mt-2">
                Real-time coding challenges with instant feedback and
                performance metrics
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-mono font-bold text-blue-600">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Problem Description */}
          <div className="space-y-6">
            {/* Challenge Info */}
            <AnimatedContainer delay={0.1}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      {sampleChallenge.title}
                    </CardTitle>
                    <Badge
                      className={getDifficultyColor(sampleChallenge.difficulty)}
                    >
                      {sampleChallenge.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={currentTab} onValueChange={setCurrentTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="description">Description</TabsTrigger>
                      <TabsTrigger value="examples">Examples</TabsTrigger>
                      <TabsTrigger value="constraints">Constraints</TabsTrigger>
                      <TabsTrigger value="hints">Hints</TabsTrigger>
                    </TabsList>

                    <TabsContent value="description" className="mt-4">
                      <div className="prose dark:prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                          {sampleChallenge.description}
                        </pre>
                      </div>
                    </TabsContent>

                    <TabsContent value="examples" className="mt-4 space-y-4">
                      {sampleChallenge.examples.map((example, index) => (
                        <div
                          key={index}
                          className="border rounded-lg p-4 bg-muted/30"
                        >
                          <h4 className="font-medium mb-2">
                            Example {index + 1}:
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <strong>Input:</strong>{" "}
                              <code>{example.input}</code>
                            </div>
                            <div>
                              <strong>Output:</strong>{" "}
                              <code>{example.output}</code>
                            </div>
                            <div>
                              <strong>Explanation:</strong>{" "}
                              {example.explanation}
                            </div>
                          </div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="constraints" className="mt-4">
                      <ul className="space-y-2">
                        {sampleChallenge.constraints.map(
                          (constraint, index) => (
                            <li
                              key={index}
                              className="flex items-center gap-2 text-sm"
                            >
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                              <code>{constraint}</code>
                            </li>
                          )
                        )}
                      </ul>
                    </TabsContent>

                    <TabsContent value="hints" className="mt-4">
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowHints(!showHints)}
                          className="flex items-center gap-2"
                        >
                          {showHints ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                          {showHints ? "Hide Hints" : "Show Hints"}
                        </Button>

                        <AnimatePresence>
                          {showHints && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-2"
                            >
                              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5" />
                                  <div className="text-sm">
                                    <strong>Hint 1:</strong> Consider using a
                                    hash map to store values and their indices
                                    as you iterate through the array.
                                  </div>
                                </div>
                              </div>
                              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5" />
                                  <div className="text-sm">
                                    <strong>Hint 2:</strong> For each number,
                                    check if its complement (target - current
                                    number) exists in your hash map.
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Test Results */}
            <AnimatedContainer delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="w-5 h-5" />
                    Test Results
                    {testResults.length > 0 && (
                      <Badge
                        variant={
                          getSuccessRate() === 100 ? "default" : "secondary"
                        }
                      >
                        {executionMetrics.passedTests}/
                        {executionMetrics.totalTests} Passed
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {testResults.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <TestTube className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Run your code to see test results</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {testResults.map((result, index) => (
                        <motion.div
                          key={result.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border",
                            result.passed
                              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {result.passed ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                            <div>
                              <div className="font-medium">
                                Test Case {index + 1}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Input: {result.input}
                              </div>
                              {!result.passed && (
                                <div className="text-xs">
                                  <span className="text-red-600">
                                    Expected: {result.expectedOutput}
                                  </span>
                                  <br />
                                  <span className="text-red-600">
                                    Got: {result.actualOutput}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            {result.executionTime?.toFixed(1)}ms
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedContainer>
          </div>

          {/* Code Editor */}
          <div className="space-y-6">
            {/* Editor Controls */}
            <AnimatedContainer delay={0.3}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Code2 className="w-5 h-5" />
                      Code Editor
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectedLanguage}
                        onValueChange={handleLanguageChange}
                      >
                        <SelectTrigger className="w-[150px]">
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
                      <Button variant="outline" size="sm" onClick={resetCode}>
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Write your solution here..."
                      className="min-h-[400px] font-mono text-sm"
                    />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Limit: {sampleChallenge.timeLimit}ms
                        </div>
                        <div className="flex items-center gap-1">
                          <MemoryStick className="w-4 h-4" />
                          Memory: {sampleChallenge.memoryLimit}MB
                        </div>
                      </div>

                      <Button
                        onClick={runCode}
                        disabled={isRunning}
                        className="flex items-center gap-2"
                      >
                        {isRunning ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            >
                              <Cpu className="w-4 h-4" />
                            </motion.div>
                            Running...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Run Code
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                              sampleChallenge.timeLimit) *
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
                              sampleChallenge.memoryLimit) *
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
                            sampleChallenge.timeLimit * 0.5
                              ? "Excellent"
                              : executionMetrics.totalTime <
                                sampleChallenge.timeLimit * 0.8
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
                                  sampleChallenge.timeLimit * 0.5
                                    ? 5
                                    : executionMetrics.totalTime <
                                      sampleChallenge.timeLimit * 0.8
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
  );
}
