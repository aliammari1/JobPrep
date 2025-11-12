import { useState } from "react";
import { toast } from "sonner";

interface GenerateChallengesParams {
  cvData: any;
  jobDescription: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  count?: number;
}

interface Challenge {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  constraints: string[];
  examples: Array<{ input: string; output: string; explanation: string }>;
  testCases: Array<{
    id: string;
    input: string;
    expectedOutput: string;
  }>;
  timeLimit: number;
  memoryLimit: number;
  category?: string;
  tags?: string[];
  hints?: string[];
  starterCode?: Record<string, string>;
}

export function useGenerateChallenges() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedChallenges, setGeneratedChallenges] = useState<Challenge[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generateChallenges = async ({
    cvData,
    jobDescription,
    difficulty = "Medium",
    count = 3,
  }: GenerateChallengesParams) => {
    setIsGenerating(true);
    setError(null);

    const loadingToast = toast.loading("🤖 AI is generating personalized challenges...", {
      description: "This may take 10-15 seconds",
    });

    try {
      const response = await fetch("/api/challenges/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cvData,
          jobDescription,
          difficulty,
          count,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate challenges");
      }

      const data = await response.json();
      
      if (!data.success || !data.challenges) {
        throw new Error("Invalid response from server");
      }

      setGeneratedChallenges(data.challenges);
      
      toast.success("✨ Personalized challenges generated!", {
        id: loadingToast,
        description: `${data.challenges.length} challenges tailored to your profile`,
      });

      return {
        challenges: data.challenges,
        metadata: data.metadata,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate challenges";
      setError(errorMessage);
      
      toast.error("Failed to generate challenges", {
        id: loadingToast,
        description: errorMessage,
      });
      
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const clearChallenges = () => {
    setGeneratedChallenges([]);
    setError(null);
  };

  return {
    generateChallenges,
    isGenerating,
    generatedChallenges,
    error,
    clearChallenges,
  };
}
