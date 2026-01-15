import { useState, useEffect } from "react";

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

interface UseChallengesReturn {
  challenges: Challenge[];
  currentChallenge: Challenge | null;
  isLoading: boolean;
  error: string | null;
  fetchChallenge: (id: string) => Promise<void>;
  fetchChallenges: (filters?: {
    difficulty?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }) => Promise<void>;
}

export function useChallenges(): UseChallengesReturn {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenge = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/challenges?id=${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch challenge");
      }

      const data = await response.json();
      setCurrentChallenge(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChallenges = async (filters?: {
    difficulty?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.difficulty) params.append("difficulty", filters.difficulty);
      if (filters?.category) params.append("category", filters.category);
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.offset) params.append("offset", filters.offset.toString());

      const response = await fetch(`/api/challenges?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch challenges");
      }

      const data = await response.json();
      setChallenges(data.challenges);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    challenges,
    currentChallenge,
    isLoading,
    error,
    fetchChallenge,
    fetchChallenges,
  };
}
