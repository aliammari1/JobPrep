// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/code-execution/route";

const { getSession, create, uploadFile, executeCommand, deleteSandbox } =
  vi.hoisted(() => ({
    getSession: vi.fn(),
    create: vi.fn(),
    uploadFile: vi.fn(),
    executeCommand: vi.fn(),
    deleteSandbox: vi.fn(),
  }));

vi.mock("@/lib/auth", () => ({ auth: { api: { getSession } } }));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: async () => ({ success: true }),
  rateLimitResponse: vi.fn(),
}));
vi.mock("@daytonaio/sdk", () => ({
  Daytona: class {
    create = create;
  },
}));

function request() {
  return new NextRequest("http://localhost/api/code-execution", {
    method: "POST",
    body: JSON.stringify({
      code: "console.log('hello')",
      language: "javascript",
      testCases: [{ id: "first", input: "", expectedOutput: "hello" }],
    }),
  });
}

describe("Daytona code execution", () => {
  beforeEach(() => {
    vi.stubEnv("DAYTONA_API_KEY", "test-key");
    getSession.mockResolvedValue({ user: { id: "test-user" } });
    create.mockResolvedValue({
      fs: { uploadFile },
      process: { executeCommand },
      delete: deleteSandbox,
    });
    deleteSandbox.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetAllMocks();
  });

  it("requires a signed-in user before creating a sandbox", async () => {
    getSession.mockResolvedValueOnce(null);

    expect((await POST(request())).status).toBe(401);
    expect(create).not.toHaveBeenCalled();
  });

  it("runs a test in a private sandbox and cleans it up", async () => {
    executeCommand.mockResolvedValueOnce({ exitCode: 0, result: "hello\n" });

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      results: [{ id: "first", passed: true, status: "Accepted" }],
      metrics: { passedTests: 1, totalTests: 1 },
    });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        ephemeral: true,
        networkBlockAll: true,
        public: false,
      }),
      expect.anything(),
    );
    expect(deleteSandbox).toHaveBeenCalledOnce();
  });

  it("cleans up if the provider fails after sandbox creation", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    executeCommand.mockRejectedValueOnce(new Error("provider details"));

    const response = await POST(request());

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Failed to execute code" });
    expect(deleteSandbox).toHaveBeenCalledOnce();
  });
});
