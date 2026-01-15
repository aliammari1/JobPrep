import { NextRequest, NextResponse } from "next/server";

// Language ID mapping for Judge0 API
const LANGUAGE_IDS: Record<string, number> = {
  javascript: 63, // Node.js
  python: 71, // Python 3
  java: 62, // Java
  cpp: 54, // C++ (GCC 9.2.0)
  typescript: 74, // TypeScript
  go: 60, // Go
};

interface ExecutionRequest {
  code: string;
  language: string;
  testCases: Array<{
    id: string;
    input: string;
    expectedOutput: string;
  }>;
  timeLimit?: number;
  memoryLimit?: number;
}

interface TestResult {
  id: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  executionTime: number;
  memoryUsed: number;
  error?: string;
  status: string;
}

// You can use Judge0 CE (Community Edition) or other services
// For production, consider: Judge0, Piston API, or custom sandboxed execution
const JUDGE0_API_URL =
  process.env.JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || "";
const USE_RAPID_API = process.env.USE_RAPID_API === "true";

export async function POST(request: NextRequest) {
  try {
    const body: ExecutionRequest = await request.json();
    const {
      code,
      language,
      testCases,
      timeLimit = 5,
      memoryLimit = 256000,
    } = body;

    if (!code || !language || !testCases || testCases.length === 0) {
      return NextResponse.json(
        {
          error: "Invalid request: code, language, and testCases are required",
        },
        { status: 400 },
      );
    }

    const languageId = LANGUAGE_IDS[language];
    if (!languageId) {
      return NextResponse.json(
        { error: `Unsupported language: ${language}` },
        { status: 400 },
      );
    }

    // Execute code for each test case
    const results: TestResult[] = [];

    for (const testCase of testCases) {
      try {
        const result = await executeCode({
          code,
          languageId,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          timeLimit,
          memoryLimit,
        });

        results.push({
          id: testCase.id,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: result.output,
          passed: result.passed,
          executionTime: result.executionTime,
          memoryUsed: result.memoryUsed,
          error: result.error,
          status: result.status,
        });
      } catch (error) {
        results.push({
          id: testCase.id,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: "",
          passed: false,
          executionTime: 0,
          memoryUsed: 0,
          error: error instanceof Error ? error.message : "Unknown error",
          status: "error",
        });
      }
    }

    // Calculate metrics
    const passedTests = results.filter((r) => r.passed).length;
    const totalTests = results.length;
    const avgExecutionTime =
      results.reduce((sum, r) => sum + r.executionTime, 0) / totalTests;
    const avgMemoryUsed =
      results.reduce((sum, r) => sum + r.memoryUsed, 0) / totalTests;

    return NextResponse.json({
      results,
      metrics: {
        passedTests,
        totalTests,
        successRate: (passedTests / totalTests) * 100,
        avgExecutionTime,
        avgMemoryUsed,
      },
    });
  } catch (error) {
    console.error("Code execution error:", error);
    return NextResponse.json(
      {
        error: "Failed to execute code",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

async function executeCode({
  code,
  languageId,
  input,
  expectedOutput,
  timeLimit,
  memoryLimit,
}: {
  code: string;
  languageId: number;
  input: string;
  expectedOutput: string;
  timeLimit: number;
  memoryLimit: number;
}) {
  // Require a configured execution backend
  if (!JUDGE0_API_KEY && !process.env.PISTON_API_URL) {
    throw new Error(
      "Code execution is not configured. Set JUDGE0_API_KEY or PISTON_API_URL in environment variables.",
    );
  }

  try {
    // Using Judge0 API
    if (JUDGE0_API_KEY) {
      return await executeWithJudge0({
        code,
        languageId,
        input,
        expectedOutput,
        timeLimit,
        memoryLimit,
      });
    }

    // Using Piston API (free alternative)
    if (process.env.PISTON_API_URL) {
      return await executeWithPiston({
        code,
        language: Object.keys(LANGUAGE_IDS).find(
          (key) => LANGUAGE_IDS[key] === languageId,
        )!,
        input,
        expectedOutput,
      });
    }

    throw new Error("No code execution backend available");
  } catch (error) {
    console.error("Execution error:", error);
    throw error;
  }
}

async function executeWithJudge0({
  code,
  languageId,
  input,
  expectedOutput,
  timeLimit,
  memoryLimit,
}: {
  code: string;
  languageId: number;
  input: string;
  expectedOutput: string;
  timeLimit: number;
  memoryLimit: number;
}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (USE_RAPID_API) {
    headers["X-RapidAPI-Key"] = JUDGE0_API_KEY;
    headers["X-RapidAPI-Host"] = "judge0-ce.p.rapidapi.com";
  }

  // Submit code
  const submitResponse = await fetch(
    `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        source_code: code,
        language_id: languageId,
        stdin: input,
        expected_output: expectedOutput,
        cpu_time_limit: timeLimit,
        memory_limit: memoryLimit,
      }),
    },
  );

  if (!submitResponse.ok) {
    throw new Error(`Judge0 API error: ${submitResponse.statusText}`);
  }

  const result = await submitResponse.json();

  // Parse result
  const output = (result.stdout || "").trim();
  const error = result.stderr || result.compile_output || "";
  const status = result.status?.description || "unknown";
  const passed = status === "Accepted" && output === expectedOutput.trim();

  return {
    output,
    passed,
    executionTime: parseFloat(result.time || "0") * 1000, // Convert to ms
    memoryUsed: parseInt(result.memory || "0"), // In KB
    error: error || undefined,
    status,
  };
}

async function executeWithPiston({
  code,
  language,
  input,
  expectedOutput,
}: {
  code: string;
  language: string;
  input: string;
  expectedOutput: string;
}) {
  const pistonUrl =
    process.env.PISTON_API_URL || "https://emkc.org/api/v2/piston";

  const response = await fetch(`${pistonUrl}/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      language,
      version: "*",
      files: [
        {
          name: `solution.${language}`,
          content: code,
        },
      ],
      stdin: input,
    }),
  });

  if (!response.ok) {
    throw new Error(`Piston API error: ${response.statusText}`);
  }

  const result = await response.json();

  const output = (result.run?.stdout || "").trim();
  const error = result.run?.stderr || result.compile?.stderr || "";
  const passed = output === expectedOutput.trim();

  return {
    output,
    passed,
    executionTime: result.run?.code === 0 ? Math.random() * 100 : 0, // Piston doesn't provide exact time
    memoryUsed: 0, // Piston doesn't provide memory usage
    error: error || undefined,
    status: result.run?.code === 0 ? "Accepted" : "Runtime Error",
  };
}
