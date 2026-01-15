"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
  executionTime?: number;
}

interface TestResultsPanelProps {
  testResults: TestCase[];
  metrics?: {
    totalTime: number;
    memoryUsed: number;
    passedTests: number;
    totalTests: number;
  };
  isRunning?: boolean;
}

export function TestResultsPanel({
  testResults,
  metrics,
  isRunning = false,
}: TestResultsPanelProps) {
  const [expandedTestIds, setExpandedTestIds] = useState<Set<string>>(
    new Set(testResults.slice(0, 1).map((t) => t.id)), // Expand first test by default
  );

  if (isRunning) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Running Tests...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (testResults.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground text-center">
            Run your code to see test results
          </p>
        </CardContent>
      </Card>
    );
  }

  const passedTests = testResults.filter((t) => t.passed).length;
  const totalTests = testResults.length;
  const successPercentage = (passedTests / totalTests) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Summary Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {successPercentage === 100 ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : successPercentage > 0 ? (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              Test Results
            </CardTitle>
            <Badge
              className={cn(
                "text-lg font-bold",
                successPercentage === 100
                  ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                  : successPercentage > 0
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"
                    : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
              )}
            >
              {passedTests}/{totalTests} Passed
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-semibold">
                {Math.round(successPercentage)}%
              </span>
            </div>
            <Progress value={successPercentage} className="h-3" />
          </div>

          {/* Metrics */}
          {metrics && (
            <div className="grid grid-cols-3 gap-3 pt-2 border-t">
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Time</div>
                <div className="font-mono font-bold text-sm">
                  {metrics.totalTime.toFixed(2)}ms
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Memory</div>
                <div className="font-mono font-bold text-sm">
                  {metrics.memoryUsed.toFixed(2)}KB
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">
                  Success
                </div>
                <div className="font-mono font-bold text-sm text-green-600">
                  {Math.round(successPercentage)}%
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Test Cases */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm px-1">Test Cases</h3>
        <AnimatePresence mode="popLayout">
          {testResults.map((test, index) => (
            <motion.div
              key={test.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={cn(
                  "cursor-pointer transition-colors hover:bg-muted/50",
                  test.passed
                    ? "border-green-200 dark:border-green-900/30 bg-green-50/30 dark:bg-green-950/10"
                    : "border-red-200 dark:border-red-900/30 bg-red-50/30 dark:bg-red-950/10",
                )}
                onClick={() => {
                  const newExpanded = new Set(expandedTestIds);
                  if (newExpanded.has(test.id)) {
                    newExpanded.delete(test.id);
                  } else {
                    newExpanded.add(test.id);
                  }
                  setExpandedTestIds(newExpanded);
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      {test.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">
                          Test Case {index + 1}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {test.input}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {test.executionTime && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Clock className="w-3 h-3" />
                          {test.executionTime.toFixed(1)}ms
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        {expandedTestIds.has(test.id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedTestIds.has(test.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CardContent className="border-t pt-4 space-y-3">
                        {/* Input */}
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Input
                          </label>
                          <code className="block mt-2 p-3 bg-muted rounded text-sm font-mono overflow-auto max-h-24">
                            {test.input}
                          </code>
                        </div>

                        {/* Expected Output */}
                        <div>
                          <label className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
                            Expected Output
                          </label>
                          <code className="block mt-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded text-sm font-mono overflow-auto max-h-24">
                            {test.expectedOutput}
                          </code>
                        </div>

                        {/* Actual Output */}
                        {test.actualOutput && (
                          <div>
                            <label
                              className={cn(
                                "text-xs font-semibold uppercase tracking-wide",
                                test.passed
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400",
                              )}
                            >
                              Actual Output
                            </label>
                            <code
                              className={cn(
                                "block mt-2 p-3 rounded text-sm font-mono overflow-auto max-h-24",
                                test.passed
                                  ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30"
                                  : "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30",
                              )}
                            >
                              {test.actualOutput}
                            </code>
                          </div>
                        )}

                        {/* Comparison */}
                        {test.actualOutput && !test.passed && (
                          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30 rounded">
                            <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                              ⚠️ Mismatch
                            </p>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300">
                              Your output doesn't match the expected result.
                              Check your logic and try again.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
