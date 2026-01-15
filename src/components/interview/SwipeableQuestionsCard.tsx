"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Target,
  Lightbulb,
  GripHorizontal,
  X,
} from "lucide-react";

interface TemplateQuestion {
  id: number;
  question: string;
  type: "technical" | "behavioral" | "cultural";
  difficulty: "Easy" | "Medium" | "Hard";
  category?: string;
  tips?: string[];
  sampleAnswer?: string;
}

interface SwipeableQuestionsCardProps {
  questions: TemplateQuestion[];
  templateName: string;
  onClose: () => void;
}

export function SwipeableQuestionsCard({
  questions,
  templateName,
  onClose,
}: SwipeableQuestionsCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

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
    } else if (dragOffset < -threshold && currentIndex < questions.length - 1) {
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
    } else if (dragOffset < -threshold && currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }

    setDragStart(null);
    setDragOffset(0);
  };

  const goToPrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const goToNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-t-lg">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {templateName}
            </h2>
            <p className="text-sm text-muted-foreground">
              Question {currentIndex + 1} of {questions.length}
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
          className="relative h-[500px] cursor-grab active:cursor-grabbing bg-white dark:bg-slate-900 rounded-lg"
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
              {/* Question Header */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge
                    className={getDifficultyColor(currentQuestion?.difficulty)}
                  >
                    {currentQuestion?.difficulty}
                  </Badge>
                  <Badge variant="outline">{currentQuestion?.type}</Badge>
                  {currentQuestion?.category && (
                    <Badge variant="secondary">
                      {currentQuestion.category}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Question
                </h3>
                <div className="p-4 bg-primary/10 rounded-lg border-l-4 border-primary">
                  <p className="text-foreground leading-relaxed">
                    {currentQuestion?.question}
                  </p>
                </div>
              </div>

              {/* Sample Answer */}
              {currentQuestion?.sampleAnswer && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    Sample Answer
                  </h3>
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border-l-4 border-green-600">
                    <p className="text-foreground leading-relaxed text-sm">
                      {currentQuestion.sampleAnswer}
                    </p>
                  </div>
                </div>
              )}

              {/* Tips */}
              {currentQuestion?.tips && currentQuestion.tips.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-600" />
                    Preparation Tips
                  </h3>
                  <ul className="space-y-2">
                    {currentQuestion.tips.map((tip, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-foreground/80"
                      >
                        <span className="text-amber-600 font-bold mt-0.5">
                          •
                        </span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
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
            disabled={currentIndex === questions.length - 1}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 z-10 p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Thumbnail Navigation */}
        <div className="bg-white dark:bg-slate-900 px-4 py-3 flex items-center gap-2 overflow-x-auto rounded-b-lg">
          {questions.map((question, idx) => (
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
              {idx + 1}
            </motion.button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 bg-white dark:bg-slate-900 p-4 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {questions.filter((q) => q.difficulty === "Easy").length}
            </div>
            <div className="text-xs text-muted-foreground">Easy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {questions.filter((q) => q.difficulty === "Medium").length}
            </div>
            <div className="text-xs text-muted-foreground">Medium</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {questions.filter((q) => q.difficulty === "Hard").length}
            </div>
            <div className="text-xs text-muted-foreground">Hard</div>
          </div>
        </div>
      </div>
    </div>
  );
}
