"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAiAnalysis } from "@/hooks/use-ai-analysis";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface AIFeedbackProps {
  question: string;
  onFeedbackComplete?: (feedback: string) => void;
}

export function AIFeedback({ question, onFeedbackComplete }: AIFeedbackProps) {
  const [answer, setAnswer] = useState("");
  const { analyzeResponse, analyzing, feedback, error, reset } =
    useAiAnalysis();

  const handleAnalyze = async () => {
    if (!answer.trim()) return;

    try {
      const result = await analyzeResponse({
        question,
        answer,
      });

      if (onFeedbackComplete) {
        onFeedbackComplete(result);
      }
    } catch (err) {
      console.error("Analysis failed:", err);
    }
  };

  const handleReset = () => {
    setAnswer("");
    reset();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Response</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="min-h-[150px]"
            disabled={analyzing || !!feedback}
          />

          <div className="flex gap-2">
            {!feedback ? (
              <Button
                onClick={handleAnalyze}
                disabled={!answer.trim() || analyzing}
                className="flex items-center gap-2"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Get AI Feedback
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleReset} variant="outline">
                Try Another Answer
              </Button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Failed to analyze response
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {error}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {feedback && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              AI Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{feedback}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
