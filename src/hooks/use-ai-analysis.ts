"use client";

import { useState } from "react";

interface AnalyzeResponseParams {
  question: string;
  answer: string;
  context?: string;
}

export function useAiAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const analyzeResponse = async (params: AnalyzeResponseParams) => {
    setAnalyzing(true);
    setError(null);
    setFeedback("");

    try {
      const response = await fetch("/api/ai/analyze-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze response");
      }

      // Stream the response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let result = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        result += chunk;
        setFeedback(result);
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setFeedback("");
    setError(null);
  };

  return { analyzeResponse, analyzing, feedback, error, reset };
}
