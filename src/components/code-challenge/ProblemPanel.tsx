"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  EyeOff,
  Copy,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Challenge {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  constraints: string[];
  examples: Array<{
    input: string;
    output: string;
    explanation: string;
  }>;
  hints?: string[];
  timeLimit?: number;
  memoryLimit?: number;
}

interface ProblemPanelProps {
  challenge?: Challenge;
  isLoading?: boolean;
  currentIndex?: number;
  totalChallenges?: number;
}

export function ProblemPanel({
  challenge,
  isLoading = false,
  currentIndex = 0,
  totalChallenges = 1,
}: ProblemPanelProps) {
  const [showHints, setShowHints] = useState(false);
  const [expandedExample, setExpandedExample] = useState<number>(0);

  if (isLoading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading challenge...</p>
        </div>
      </Card>
    );
  }

  if (!challenge) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center">
          <Target className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">No challenge selected</p>
        </div>
      </Card>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return {
          bg: "bg-green-100 dark:bg-green-950/30",
          text: "text-green-700 dark:text-green-300",
          border: "border-green-200 dark:border-green-800",
        };
      case "Medium":
        return {
          bg: "bg-yellow-100 dark:bg-yellow-950/30",
          text: "text-yellow-700 dark:text-yellow-300",
          border: "border-yellow-200 dark:border-yellow-800",
        };
      case "Hard":
        return {
          bg: "bg-red-100 dark:bg-red-950/30",
          text: "text-red-700 dark:text-red-300",
          border: "border-red-200 dark:border-red-800",
        };
      default:
        return {
          bg: "bg-gray-100 dark:bg-gray-950/30",
          text: "text-gray-700 dark:text-gray-300",
          border: "border-gray-200 dark:border-gray-800",
        };
    }
  };

  const difficultyColors = getDifficultyColor(challenge.difficulty);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col"
    >
      <Card className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <CardHeader className="pb-3 border-b">
          <div className="space-y-3">
            {/* Title and Difficulty */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h2 className="text-lg font-bold truncate">{challenge.title}</h2>
                  <Badge
                    className={cn(
                      "text-xs font-semibold h-fit whitespace-nowrap",
                      difficultyColors.bg,
                      difficultyColors.text
                    )}
                  >
                    {challenge.difficulty}
                  </Badge>
                </div>
                {totalChallenges > 1 && (
                  <p className="text-xs text-muted-foreground">
                    Challenge {currentIndex + 1} of {totalChallenges}
                  </p>
                )}
              </div>
            </div>

            {/* Limits and Stats - Compact */}
            {(challenge.timeLimit || challenge.memoryLimit) && (
              <div className="flex flex-wrap items-center gap-3 text-xs p-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded">
                {challenge.timeLimit && (
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span>
                      <span className="font-semibold">{challenge.timeLimit}ms</span>
                    </span>
                  </div>
                )}
                {challenge.memoryLimit && (
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">{challenge.memoryLimit}MB</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="flex-1 overflow-y-auto p-4">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-9 mb-4">
              <TabsTrigger value="description" className="text-xs">Description</TabsTrigger>
              <TabsTrigger value="examples" className="text-xs">Examples</TabsTrigger>
              <TabsTrigger value="constraints" className="text-xs">Hints</TabsTrigger>
            </TabsList>

            {/* Description Tab */}
            <TabsContent value="description" className="mt-4 space-y-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-xs leading-relaxed font-sans bg-muted/40 p-3 rounded border overflow-auto max-h-[200px]">
                  {challenge.description}
                </pre>
              </div>
            </TabsContent>

            {/* Examples Tab */}
            <TabsContent value="examples" className="mt-6 space-y-4">
              {challenge.examples.map((example, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-muted/50",
                      expandedExample === index && "ring-2 ring-primary"
                    )}
                    onClick={() =>
                      setExpandedExample(
                        expandedExample === index ? -1 : index
                      )
                    }
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-semibold text-sm">
                          Example {index + 1}
                        </h4>
                        {expandedExample === index ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </CardHeader>

                    <AnimatePresence>
                      {expandedExample === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <CardContent className="border-t space-y-3">
                            {/* Input */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">
                                  Input
                                </label>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(
                                      example.input
                                    );
                                    toast.success("Input copied!");
                                  }}
                                >
                                  <Copy className="w-3 h-3 mr-1" />
                                  Copy
                                </Button>
                              </div>
                              <code className="block p-3 bg-muted rounded text-sm font-mono overflow-auto max-h-20 whitespace-pre-wrap">
                                {example.input}
                              </code>
                            </div>

                            {/* Output */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase">
                                  Output
                                </label>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(
                                      example.output
                                    );
                                    toast.success("Output copied!");
                                  }}
                                >
                                  <Copy className="w-3 h-3 mr-1" />
                                  Copy
                                </Button>
                              </div>
                              <code className="block p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded text-sm font-mono overflow-auto max-h-20 whitespace-pre-wrap">
                                {example.output}
                              </code>
                            </div>

                            {/* Explanation */}
                            {example.explanation && (
                              <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">
                                  Explanation
                                </label>
                                <p className="text-sm leading-relaxed bg-muted/30 p-3 rounded">
                                  {example.explanation}
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
            </TabsContent>

            {/* Hints/Constraints Tab */}
            <TabsContent value="constraints" className="mt-4 space-y-4">
              {/* Hints Section */}
              {challenge.hints && challenge.hints.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    Hints
                  </h3>
                  <div className="space-y-2">
                    {challenge.hints.map((hint, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded text-sm"
                      >
                        <p className="text-amber-900 dark:text-amber-100">
                          <span className="font-semibold">Hint {index + 1}:</span> {hint}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Constraints Section */}
              {challenge.constraints && challenge.constraints.length > 0 && (
                <div className={cn(challenge.hints && challenge.hints.length > 0 && "pt-4 border-t")}>
                  <h3 className="font-semibold text-sm mb-3">Constraints</h3>
                  <ul className="space-y-2">
                    {challenge.constraints.map((constraint, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-2 text-xs"
                      >
                        <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">
                          •
                        </span>
                        <code className="bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded flex-1 break-words text-xs">
                          {constraint}
                        </code>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {!challenge.hints && !challenge.constraints && (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">No additional information available</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
