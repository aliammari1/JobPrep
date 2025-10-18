"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AIFeedback } from "@/components/interview/ai-feedback";
import { useAiQuestions } from "@/hooks/use-ai-questions";
import { Brain, Loader2, ChevronRight, RotateCcw } from "lucide-react";

interface Question {
  text: string;
  category: string;
  difficulty: string;
}

export default function PracticeInterviewPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const { generateQuestions, loading } = useAiQuestions();

  const handleGenerateQuestions = async () => {
    try {
      const generated = await generateQuestions({
        role: "Full-Stack Developer",
        skillLevel: "mid-level",
        count: 5,
        focus: "React, Node.js, System Design, Problem Solving",
      });

      setQuestions(generated);
      setHasStarted(true);
      setCurrentIndex(0);
    } catch (error) {
      console.error("Failed to generate questions:", error);
      alert("Failed to generate questions. Please check your OpenAI API key.");
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleReset = () => {
    setHasStarted(false);
    setQuestions([]);
    setCurrentIndex(0);
  };

  const currentQuestion = questions[currentIndex];

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Brain className="w-8 h-8 text-blue-600" />
              AI-Powered Practice Interview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-3">What You'll Get:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">✓</span>
                    <span>
                      5 AI-generated questions tailored to Full-Stack Developer
                      role
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">✓</span>
                    <span>Real-time AI feedback on your responses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">✓</span>
                    <span>
                      Detailed analysis of communication, technical accuracy,
                      and areas for improvement
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">✓</span>
                    <span>Practice at your own pace with instant feedback</span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> This feature requires an OpenAI API key
                  configured in your .env.local file.
                </p>
              </div>
            </div>

            <Button
              onClick={handleGenerateQuestions}
              disabled={loading}
              className="w-full h-12 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5 mr-2" />
                  Start Practice Interview
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Practice Interview</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Progress */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        {/* Question */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-xl">Interview Question</CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline">{currentQuestion.category}</Badge>
                <Badge
                  variant={
                    currentQuestion.difficulty === "hard"
                      ? "destructive"
                      : currentQuestion.difficulty === "medium"
                      ? "default"
                      : "secondary"
                  }
                >
                  {currentQuestion.difficulty}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">{currentQuestion.text}</p>
          </CardContent>
        </Card>

        {/* AI Feedback Component */}
        <AIFeedback
          question={currentQuestion.text}
          onFeedbackComplete={() => {
            // Feedback completed
          }}
        />

        {/* Navigation */}
        <div className="flex justify-end">
          {currentIndex < questions.length - 1 && (
            <Button onClick={handleNext}>
              Next Question
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          {currentIndex === questions.length - 1 && (
            <Button onClick={handleReset} variant="default">
              <RotateCcw className="w-4 h-4 mr-2" />
              Start New Session
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
