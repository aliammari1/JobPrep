import { useState } from "react";
import { toast } from "sonner";

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
  executionTime?: number;
}

interface ExecutionMetrics {
  totalTime: number;
  memoryUsed: number;
  passedTests: number;
  totalTests: number;
}

interface UseCodeExecutionReturn {
  executeCode: (
    code: string,
    language: string,
    testCases: TestCase[]
  ) => Promise<{
    results: TestCase[];
    metrics: ExecutionMetrics;
  }>;
  isExecuting: boolean;
  error: string | null;
}

export function useCodeExecution(): UseCodeExecutionReturn {
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeCode = async (
    code: string,
    language: string,
    testCases: TestCase[]
  ) => {
    setIsExecuting(true);
    setError(null);

    try {
      const response = await fetch("/api/code-execution", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language,
          testCases,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to execute code");
      }

      const data = await response.json();

      return {
        results: data.results,
        metrics: {
          totalTime: data.metrics.avgExecutionTime,
          memoryUsed: data.metrics.avgMemoryUsed,
          passedTests: data.metrics.passedTests,
          totalTests: data.metrics.totalTests,
        },
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast.error("Execution failed", {
        description: errorMessage,
      });
      throw err;
    } finally {
      setIsExecuting(false);
    }
  };

  return {
    executeCode,
    isExecuting,
    error,
  };
}
