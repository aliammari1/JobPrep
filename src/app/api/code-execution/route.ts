import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

// Language ID mapping for Judge0 API
const LANGUAGE_IDS = {
  javascript: 63, // Node.js
  python: 71, // Python 3
  java: 62, // Java
  cpp: 54, // C++ (GCC 9.2.0)
  typescript: 74, // TypeScript
  go: 60, // Go
};

const executionRequest = z.object({
  code: z.string().min(1).max(65_536),
  language: z.enum(["javascript", "python", "java", "cpp", "typescript", "go"]),
  testCases: z
    .array(
      z.object({
        id: z.string().min(1).max(128),
        input: z.string().max(65_536),
        expectedOutput: z.string().max(65_536),
      }),
    )
    .min(1)
    .max(20),
  timeLimit: z.number().positive().max(10).default(5),
  memoryLimit: z.number().int().positive().max(512_000).default(256_000),
});

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

// Supported backends (in priority order):
// 1. Daytona Sandbox (`DAYTONA_API_KEY`)
// 2. Judge0 CE (`JUDGE0_API_KEY`)
// 3. Piston API (`PISTON_API_URL`) — free fallback
const JUDGE0_API_URL =
  process.env.JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || "";
const USE_RAPID_API = process.env.USE_RAPID_API === "true";

const DAYTONA_RUN_COMMANDS: Record<
  string,
  {
    ext: string;
    runtime: "python" | "typescript" | "javascript";
    cmd: (file: string) => string;
  }
> = {
  javascript: { ext: "js", runtime: "javascript", cmd: (f) => `node ${f}` },
  typescript: {
    ext: "ts",
    runtime: "typescript",
    cmd: (f) => `node --experimental-strip-types ${f}`,
  },
  python: { ext: "py", runtime: "python", cmd: (f) => `python3 ${f}` },
  go: { ext: "go", runtime: "python", cmd: (f) => `go run ${f}` },
  cpp: {
    ext: "cpp",
    runtime: "python",
    cmd: (f) => `g++ -O2 ${f} -o /tmp/sol && /tmp/sol`,
  },
  java: {
    ext: "java",
    runtime: "python",
    cmd: (f) => `javac ${f} && java -cp /tmp Solution`,
  },
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const limit = await rateLimit(
      request,
      "default",
      `code-execution:${session.user.id}`,
    );
    if (!limit.success) return rateLimitResponse(limit);

    const parsed = executionRequest.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid code execution request" },
        { status: 400 },
      );
    }
    const { code, language, testCases, timeLimit, memoryLimit } = parsed.data;

    if (
      !process.env.DAYTONA_API_KEY &&
      !JUDGE0_API_KEY &&
      !process.env.PISTON_API_URL
    ) {
      return NextResponse.json(
        { error: "Code execution is not configured" },
        { status: 503 },
      );
    }

    // Execute code for each test case (Daytona reuses one ephemeral sandbox for all cases)
    const results: TestResult[] = process.env.DAYTONA_API_KEY
      ? await executeBatchWithDaytona({ code, language, testCases, timeLimit })
      : await (async () => {
          const batch: TestResult[] = [];
          for (const testCase of testCases) {
            try {
              const result = await executeCode({
                code,
                language,
                input: testCase.input,
                expectedOutput: testCase.expectedOutput,
                timeLimit,
                memoryLimit,
              });

              batch.push({
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
              batch.push({
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
          return batch;
        })();

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
    // Provider errors can contain request headers or submitted code.
    console.error(
      "Code execution failed",
      error instanceof Error ? error.name : "Unknown error",
    );
    return NextResponse.json(
      {
        error: "Failed to execute code",
      },
      { status: 500 },
    );
  }
}

async function executeCode({
  code,
  language,
  input,
  expectedOutput,
  timeLimit,
  memoryLimit,
}: {
  code: string;
  language: keyof typeof LANGUAGE_IDS;
  input: string;
  expectedOutput: string;
  timeLimit: number;
  memoryLimit: number;
}) {
  if (JUDGE0_API_KEY) {
    return executeWithJudge0({
      code,
      languageId: LANGUAGE_IDS[language],
      input,
      expectedOutput,
      timeLimit,
      memoryLimit,
    });
  }

  return executeWithPiston({ code, language, input, expectedOutput });
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
    memoryUsed: parseInt(result.memory || "0", 10), // In KB
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

  const startedAt = performance.now();
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
  const elapsedMs = Math.round(performance.now() - startedAt);

  const output = (result.run?.stdout || "").trim();
  const error = result.run?.stderr || result.compile?.stderr || "";
  const passed = result.run?.code === 0 && output === expectedOutput.trim();

  return {
    output,
    passed,
    executionTime: result.run?.code === 0 ? elapsedMs : 0,
    memoryUsed: 0, // Piston doesn't provide memory usage
    error: error || undefined,
    status: result.run?.code === 0 ? "Accepted" : "Runtime Error",
  };
}

async function executeBatchWithDaytona({
  code,
  language,
  testCases,
  timeLimit,
}: {
  code: string;
  language: string;
  testCases: z.infer<typeof executionRequest>["testCases"];
  timeLimit: number;
}): Promise<TestResult[]> {
  const spec = DAYTONA_RUN_COMMANDS[language];
  if (!spec) {
    throw new Error(`Unsupported Daytona language: ${language}`);
  }

  const { Daytona } = await import("@daytonaio/sdk");
  const daytona = new Daytona({
    apiKey: process.env.DAYTONA_API_KEY,
    apiUrl: process.env.DAYTONA_API_URL,
    requestTimeoutMs: 15_000,
  });

  const sandbox = await daytona.create(
    {
      language: spec.runtime,
      snapshot: process.env.DAYTONA_SNAPSHOT,
      ephemeral: true,
      ttlMinutes: 15,
      public: false,
      networkBlockAll: true,
    },
    { timeout: 30 },
  );

  try {
    const filePath = `/tmp/Solution.${spec.ext}`;
    await sandbox.fs.uploadFile(Buffer.from(code, "utf8"), filePath, 15);

    const results: TestResult[] = [];
    for (const testCase of testCases) {
      const inputPath = "/tmp/jobprep-input.txt";
      await sandbox.fs.uploadFile(
        Buffer.from(testCase.input, "utf8"),
        inputPath,
        15,
      );

      const startedAt = performance.now();
      const exec = await sandbox.process.executeCommand(
        `${spec.cmd(filePath)} < ${inputPath}`,
        "/tmp",
        undefined,
        Math.max(1, Math.ceil(timeLimit)),
      );
      const elapsedMs = Math.round(performance.now() - startedAt);
      const output = (exec.result || "").trim();
      const ok = exec.exitCode === 0;
      const passed = ok && output === testCase.expectedOutput.trim();

      results.push({
        id: testCase.id,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: output,
        passed,
        executionTime: elapsedMs,
        memoryUsed: 0,
        error: ok ? undefined : output || `Exited with code ${exec.exitCode}`,
        status: passed ? "Accepted" : ok ? "Wrong Answer" : "Runtime Error",
      });
    }
    return results;
  } finally {
    await sandbox.delete().catch(() => {
      console.error("Could not delete the Daytona code execution sandbox");
    });
  }
}
