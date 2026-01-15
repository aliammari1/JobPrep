"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
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

interface FullPageAnswersViewProps {
  interviewResults: QuestionResult[];
  onClose: () => void;
}

export function FullPageAnswersView({
  interviewResults,
  onClose,
}: FullPageAnswersViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const questions = interviewResults;
  const currentQuestion = questions[currentIndex];

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentIndex, onClose]);

  useEffect(() => {
    checkScrollPosition();
  }, [currentIndex]);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const scrollToCard = (index: number) => {
    setCurrentIndex(index);
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollLeft = index * cardWidth;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-100 text-green-800";
    if (score >= 6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const strongAnswers = questions.filter(
    (r) => (r.evaluation?.score || 0) >= 8,
  ).length;
  const averageAnswers = questions.filter((r) => {
    const score = r.evaluation?.score || 0;
    return score >= 6 && score < 8;
  }).length;
  const weakAnswers = questions.filter(
    (r) => (r.evaluation?.score || 0) < 6,
  ).length;

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Interview Answers Review
          </h1>
          <p className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-10 w-10"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="bg-muted border-b border-border px-6 py-4 flex items-center gap-8">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-accent" />
          <span className="text-sm font-semibold text-foreground">
            Strong:{" "}
            <span className="text-accent font-bold">{strongAnswers}</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-accent" />
          <span className="text-sm font-semibold text-foreground">
            Average:{" "}
            <span className="text-accent font-bold">{averageAnswers}</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <span className="text-sm font-semibold text-foreground">
            Weak:{" "}
            <span className="text-destructive font-bold">{weakAnswers}</span>
          </span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">
            Progress
          </span>
          <div className="w-64 bg-border rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content - Horizontal Scroll */}
      <div className="flex-1 overflow-hidden bg-background flex items-center">
        <div className="w-full h-full flex items-center px-4">
          {/* Left Arrow */}
          {currentIndex > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevious}
              className="absolute left-4 z-10 h-12 w-12 rounded-full bg-card shadow-xl hover:bg-secondary border border-border text-primary"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar w-full h-full items-center"
            style={{ scrollBehavior: "smooth" }}
          >
            {questions.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="shrink-0 w-full h-full flex items-center justify-center px-8 snap-center"
              >
                <Card className="w-full max-w-4xl h-5/6 overflow-y-auto shadow-2xl border-border bg-card">
                  <CardHeader className="bg-secondary border-b-2 border-border sticky top-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-sm font-semibold text-muted-foreground mb-2">
                          {result.question.type === "technical"
                            ? "💻 Technical Question"
                            : "🎯 Behavioral Question"}
                        </div>
                        <CardTitle className="text-xl text-foreground">
                          {result.question.question}
                        </CardTitle>
                      </div>
                      <Badge
                        className={`${getScoreBadgeColor(
                          result.evaluation?.score || 0,
                        )} text-primary-foreground text-lg px-4 py-2 font-bold`}
                      >
                        {(result.evaluation?.score || 0).toFixed(1)}/10
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6 space-y-6">
                    {/* Your Answer Section */}
                    <div className="space-y-2">
                      <h3 className="font-bold text-base flex items-center gap-2 text-foreground">
                        <span className="text-lg">📝</span> Your Answer
                      </h3>
                      <div className="bg-secondary border-2 border-border rounded-lg p-4 text-sm leading-relaxed text-foreground">
                        {result.userAnswer}
                      </div>
                    </div>

                    {/* Ideal Answer Section */}
                    <div className="space-y-2">
                      <h3 className="font-bold text-base flex items-center gap-2 text-foreground">
                        <span className="text-lg">✓</span> Ideal Answer
                      </h3>
                      <div className="bg-accent/10 border-2 border-accent rounded-lg p-4 text-sm leading-relaxed text-foreground">
                        {result.question.idealAnswer}
                      </div>
                    </div>

                    {/* Strengths */}
                    {result.evaluation?.strengths &&
                      result.evaluation.strengths.length > 0 && (
                        <div className="space-y-2 bg-accent/10 border-l-4 border-accent p-4 rounded">
                          <h4 className="font-bold text-accent flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            Strengths
                          </h4>
                          <ul className="space-y-1">
                            {result.evaluation.strengths.map((s, i) => (
                              <li
                                key={i}
                                className="text-sm text-foreground flex gap-2"
                              >
                                <span className="text-accent font-bold">✓</span>
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {/* Weaknesses */}
                    {result.evaluation?.weaknesses &&
                      result.evaluation.weaknesses.length > 0 && (
                        <div className="space-y-2 bg-destructive/10 border-l-4 border-destructive p-4 rounded">
                          <h4 className="font-bold text-destructive flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Areas for Improvement
                          </h4>
                          <ul className="space-y-1">
                            {result.evaluation.weaknesses.map((w, i) => (
                              <li
                                key={i}
                                className="text-sm text-foreground flex gap-2"
                              >
                                <span className="text-destructive font-bold">
                                  •
                                </span>
                                <span>{w}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {/* Suggestions */}
                    {result.evaluation?.suggestions &&
                      result.evaluation.suggestions.length > 0 && (
                        <div className="space-y-2 bg-primary/10 border-l-4 border-primary p-4 rounded">
                          <h4 className="font-bold text-primary flex items-center gap-2">
                            <Lightbulb className="w-5 h-5" />
                            Suggestions for Improvement
                          </h4>
                          <ul className="space-y-1">
                            {result.evaluation.suggestions.map((s, i) => (
                              <li
                                key={i}
                                className="text-sm text-foreground flex gap-2"
                              >
                                <span className="text-primary font-bold">
                                  •
                                </span>
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {/* General Feedback */}
                    {result.evaluation?.feedback && (
                      <div className="space-y-2">
                        <h4 className="font-bold text-foreground">
                          Overall Feedback
                        </h4>
                        <div className="bg-muted border-2 border-border rounded-lg p-4 text-sm text-foreground leading-relaxed">
                          {result.evaluation.feedback}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Right Arrow */}
          {currentIndex < questions.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className="absolute right-4 z-10 h-12 w-12 rounded-full bg-card shadow-xl hover:bg-secondary border border-border text-primary"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}
        </div>
      </div>

      {/* Bottom Thumbnail Navigation */}
      <div className="bg-card border-t-2 border-border px-6 py-4 overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {questions.map((result, index) => (
            <motion.button
              key={index}
              onClick={() => scrollToCard(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`shrink-0 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                index === currentIndex
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : `${getScoreColor(result.evaluation?.score || 0)} cursor-pointer hover:opacity-80 shadow-sm border border-border`
              }`}
            >
              Q{index + 1}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Hide scrollbar styles */}
      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
