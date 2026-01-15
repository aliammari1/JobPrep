"use client";

import { useState } from "react";

interface SkillGapParams {
  jobDescription: string;
  cvSkills: string[];
}

interface SkillGap {
  skill: string;
  proficiency: "beginner" | "intermediate" | "advanced" | "expert";
  required: boolean;
  found: boolean;
  importance: "critical" | "high" | "medium" | "low";
}

interface LearningResource {
  title: string;
  provider: string;
  duration: string;
  type: "course" | "certification" | "tutorial" | "book";
  url: string;
  rating: number;
  price: "free" | "paid";
}

interface SkillAnalysis {
  matchPercentage: number;
  missingSkills: SkillGap[];
  matchingSkills: SkillGap[];
  learningPath: LearningResource[];
}

export function useSkillGapAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SkillAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeSkillGap = async (params: SkillGapParams) => {
    setAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch("/api/ai/analyze-skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze skill gap");
      }

      const result = await response.json();
      setAnalysis(result);
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
    setAnalysis(null);
    setError(null);
  };

  return { analyzeSkillGap, analyzing, analysis, error, reset };
}
