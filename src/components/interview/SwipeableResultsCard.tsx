"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  GripHorizontal,
  X,
} from "lucide-react";

interface QuestionResult {
  question: {
    id: number;
    type: "technical" | "behavioral";
    question: string;
    idealAnswer: string;
    evaluationCriteria: string[];
  };
  userAnswer: string;
  evaluation?: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    feedback: string;
    keyPointsCovered: string[];
    keyPointsMissed: string[];
  };
  timeSpent: number;
}

interface SwipeableResultsCardProps {
  interviewResults: QuestionResult[];
  onClose: () => void;
}

export function SwipeableResultsCard({
  interviewResults,
  onClose,
}: SwipeableResultsCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentResult = interviewResults[currentIndex];
  const progress = ((currentIndex + 1) / interviewResults.length) * 100;

  // Handle mouse drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStart === null) return;
    const currentX = e.clientX;
    const diff = currentX - dragStart;
    setDragOffset(diff);
  };

  const handleMouseUp = () => {
    if (dragStart === null) return;

    const threshold = 50;

    if (dragOffset > threshold && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (
      dragOffset < -threshold &&
      currentIndex < interviewResults.length - 1
    ) {
      setCurrentIndex(currentIndex + 1);
    }

    setDragStart(null);
    setDragOffset(0);
  };

  // Handle touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStart === null) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - dragStart;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (dragStart === null) return;

    const threshold = 50;

    if (dragOffset > threshold && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (
      dragOffset < -threshold &&
      currentIndex < interviewResults.length - 1
    ) {
      setCurrentIndex(currentIndex + 1);
    }

    setDragStart(null);
    setDragOffset(0);
  };

  const goToPrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const goToNext = () => {
    if (currentIndex < interviewResults.length - 1)
      setCurrentIndex(currentIndex + 1);
  };

  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-t-lg">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Answer Review
            </h2>
            <p className="text-sm text-muted-foreground">
              Question {currentIndex + 1} of {interviewResults.length}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="bg-white dark:bg-slate-900 px-4 py-3 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">
              Progress
            </span>
            <span className="text-sm font-semibold text-primary">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-linear-to-r from-primary to-secondary rounded-full"
              layoutId="progress"
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
            />
          </div>
        </div>

        {/* Swipeable Card Container */}
        <div
          ref={containerRef}
          className="relative h-[600px] cursor-grab active:cursor-grabbing bg-white dark:bg-slate-900 rounded-lg"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100, rotateY: 20 }}
              animate={{
                opacity: 1,
                x: dragOffset,
                rotateY: 0,
              }}
              exit={{ opacity: 0, x: -100, rotateY: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-0 w-full p-8 space-y-6 overflow-y-auto"
              style={{ perspective: "1000px" }}
            >
              {/* Score Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      (currentResult?.evaluation?.score || 0) >= 7
                        ? "bg-green-500"
                        : (currentResult?.evaluation?.score || 0) >= 5
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }
                  >
                    {currentResult?.question?.type}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    ⏱️ {currentResult?.timeSpent || 0}s
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-primary">
                    {currentResult?.evaluation?.score || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">/ 10</div>
                </div>
              </div>

              {/* Question */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">📋 Question</h3>
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border-l-4 border-indigo-600">
                  <p className="text-foreground leading-relaxed">
                    {currentResult?.question?.question}
                  </p>
                </div>
              </div>

              {/* User's Answer */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">✍️ Your Answer</h3>
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border-l-4 border-blue-600">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap text-sm line-clamp-6">
                    {currentResult?.userAnswer || "No answer provided"}
                  </p>
                </div>
              </div>

              {/* Ideal Answer */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">
                  ✅ Ideal Answer
                </h3>
                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border-l-4 border-green-600">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap text-sm line-clamp-6">
                    {currentResult?.question?.idealAnswer ||
                      "Sample answer not available"}
                  </p>
                </div>
              </div>

              {/* Feedback */}
              {currentResult?.evaluation && (
                <div className="space-y-4 pt-4 border-t border-muted">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      💬 Feedback
                    </h4>
                    <p className="text-sm text-foreground/80 italic">
                      {currentResult.evaluation.feedback}
                    </p>
                  </div>

                  {currentResult.evaluation.strengths?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-green-700 dark:text-green-400 flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Strengths
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {currentResult.evaluation.strengths.map(
                          (strength, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-foreground/80"
                            >
                              <span className="text-green-600 mt-1">✓</span>
                              <span>{strength}</span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}

                  {currentResult.evaluation.suggestions?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4" />
                        Suggestions
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {currentResult.evaluation.suggestions.map(
                          (suggestion, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-foreground/80"
                            >
                              <span className="text-amber-600 mt-1">💡</span>
                              <span>{suggestion}</span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <motion.button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 z-10 p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>

          <motion.button
            onClick={goToNext}
            disabled={currentIndex === interviewResults.length - 1}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 z-10 p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Thumbnail Navigation */}
        <div className="bg-white dark:bg-slate-900 px-4 py-3 flex items-center gap-2 overflow-x-auto rounded-b-lg">
          {interviewResults.map((result, idx) => (
            <motion.button
              key={idx}
              onClick={() => goToQuestion(idx)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`shrink-0 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                idx === currentIndex
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <span className="flex items-center gap-1">
                {idx + 1}
                {(result.evaluation?.score || 0) >= 7 && (
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                )}
                {(result.evaluation?.score || 0) < 5 && (
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                )}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 bg-white dark:bg-slate-900 p-4 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {
                interviewResults.filter(
                  (r) => r.evaluation && r.evaluation.score >= 7,
                ).length
              }
            </div>
            <div className="text-xs text-muted-foreground">Strong</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {
                interviewResults.filter(
                  (r) =>
                    r.evaluation &&
                    r.evaluation.score >= 5 &&
                    r.evaluation.score < 7,
                ).length
              }
            </div>
            <div className="text-xs text-muted-foreground">Average</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {
                interviewResults.filter(
                  (r) => r.evaluation && r.evaluation.score < 5,
                ).length
              }
            </div>
            <div className="text-xs text-muted-foreground">Needs Work</div>
          </div>
        </div>
      </div>
    </div>
  );
}
