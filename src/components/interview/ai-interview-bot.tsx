"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Brain,
  Lightbulb,
  TrendingUp,
  Target,
  MessageSquare,
  Code,
  PenTool,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  question: string;
  type: "behavioral" | "technical" | "coding" | "system-design";
  difficulty: "easy" | "medium" | "hard";
  timeLimit?: number;
  hint?: string;
}

interface AIInterviewBotProps {
  currentQuestion?: Question;
  onAnswer?: (answer: string) => void;
  onNext?: () => void;
  onHint?: () => void;
  timeRemaining?: number;
  progress?: number;
  isListening?: boolean;
  className?: string;
}

export function AIInterviewBot({
  currentQuestion,
  onAnswer,
  onNext,
  onHint,
  timeRemaining = 300,
  progress = 0,
  isListening = false,
  className,
}: AIInterviewBotProps) {
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "hard":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "behavioral":
        return <MessageSquare className="w-4 h-4" />;
      case "technical":
        return <Brain className="w-4 h-4" />;
      case "coding":
        return <Code className="w-4 h-4" />;
      case "system-design":
        return <PenTool className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const handleSubmit = () => {
    if (answer.trim()) {
      setAiThinking(true);
      onAnswer?.(answer);

      // Simulate AI processing time
      setTimeout(() => {
        setAiThinking(false);
        setAnswer("");
      }, 2000);
    }
  };

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            AI Interviewer
          </CardTitle>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {formatTime(timeRemaining)}
            </div>
            <Progress value={progress} className="w-20" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-6">
        {currentQuestion && (
          <>
            {/* Question Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {getTypeIcon(currentQuestion.type)}
                <Badge variant="outline" className="capitalize">
                  {currentQuestion.type.replace("-", " ")}
                </Badge>
                <Badge
                  className={cn(
                    "text-white capitalize",
                    getDifficultyColor(currentQuestion.difficulty),
                  )}
                >
                  {currentQuestion.difficulty}
                </Badge>
              </div>

              {/* AI Avatar with Animation */}
              <motion.div
                animate={
                  isListening
                    ? {
                        scale: [1, 1.05, 1],
                        boxShadow: [
                          "0 0 0 0 rgba(59, 130, 246, 0.4)",
                          "0 0 0 10px rgba(59, 130, 246, 0)",
                          "0 0 0 0 rgba(59, 130, 246, 0)",
                        ],
                      }
                    : {}
                }
                transition={{
                  duration: 1.5,
                  repeat: isListening ? Infinity : 0,
                  ease: "easeInOut",
                }}
                className="w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto"
              >
                <Brain className="w-8 h-8 text-white" />
              </motion.div>

              {/* Question */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-muted/50 rounded-lg p-4"
              >
                <p className="text-lg leading-relaxed">
                  {currentQuestion.question}
                </p>
              </motion.div>
            </div>

            {/* Hint Section */}
            <AnimatePresence>
              {showHint && currentQuestion.hint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
                >
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-1">
                        Hint
                      </h4>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        {currentQuestion.hint}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Answer Input */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Your Answer</label>
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Share your thoughts here..."
                className="min-h-[120px] resize-none"
                disabled={aiThinking}
              />

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {currentQuestion.hint && !showHint && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowHint(true)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Lightbulb className="w-4 h-4 mr-1" />
                      Get Hint
                    </Button>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={onNext}
                    disabled={aiThinking}
                  >
                    Skip Question
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!answer.trim() || aiThinking}
                    className="min-w-[100px]"
                  >
                    {aiThinking ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      "Submit"
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* AI Feedback */}
            <AnimatePresence>
              {aiThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-950/10 dark:to-purple-950/10 rounded-lg p-4 border border-blue-200 dark:border-blue-800"
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Brain className="w-5 h-5 text-blue-500" />
                    </motion.div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      AI is analyzing your response...
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Additional AI status indicators
export function AIStatusIndicator({
  status,
  className,
}: {
  status: "thinking" | "listening" | "speaking" | "idle";
  className?: string;
}) {
  const getStatusConfig = () => {
    switch (status) {
      case "thinking":
        return { color: "text-blue-500", icon: Brain, text: "Thinking..." };
      case "listening":
        return {
          color: "text-green-500",
          icon: AlertCircle,
          text: "Listening...",
        };
      case "speaking":
        return {
          color: "text-purple-500",
          icon: MessageSquare,
          text: "Speaking...",
        };
      default:
        return { color: "text-gray-500", icon: CheckCircle, text: "Ready" };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <motion.div
        animate={status !== "idle" ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <Icon className={cn("w-4 h-4", config.color)} />
      </motion.div>
      <span className={cn("text-sm", config.color)}>{config.text}</span>
    </div>
  );
}
