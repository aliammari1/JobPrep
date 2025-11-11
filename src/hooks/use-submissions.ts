import { useState } from "react";
import { toast } from "sonner";

interface SubmitSolutionParams {
  challengeId: string;
  language: string;
  code: string;
  testResults: any[];
  metrics: any;
  timeElapsed: number;
}

interface UseSubmissionsReturn {
  submitSolution: (params: SubmitSolutionParams) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

export function useSubmissions(): UseSubmissionsReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitSolution = async (params: SubmitSolutionParams) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit solution");
      }

      const data = await response.json();

      if (data.status === "ACCEPTED") {
        toast.success("Solution Accepted!", {
          description: "Congratulations! All test cases passed.",
        });
      } else {
        toast.info("Solution Submitted", {
          description: `${params.metrics.passedTests}/${params.metrics.totalTests} test cases passed.`,
        });
      }

      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast.error("Submission failed", {
        description: errorMessage,
      });
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitSolution,
    isSubmitting,
    error,
  };
}
