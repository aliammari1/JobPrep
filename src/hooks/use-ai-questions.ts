"use client";

import { useState } from "react";

interface Question {
  text: string;
  category: "technical" | "behavioral" | "situational";
  difficulty: "easy" | "medium" | "hard";
  expectedAnswer?: string;
}

interface GenerateQuestionsParams {
  role: string;
  skillLevel: string;
  count?: number;
  focus?: string;
}

export function useAiQuestions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQuestions = async (
    params: GenerateQuestionsParams,
  ): Promise<Question[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate questions");
      }

      const data = await response.json();
      return data.questions;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { generateQuestions, loading, error };
}
