import { afterEach, describe, expect, it, vi } from "vitest";
import {
  checkBrowserAIAvailability,
  runLocalBrowserCoach,
} from "@/lib/ai/browser-ai";

interface FakeSession {
  prompt: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
}

function installApi(overrides: Record<string, unknown> = {}) {
  const api = {
    availability: vi.fn().mockResolvedValue("available"),
    create: vi.fn(),
    ...overrides,
  };
  vi.stubGlobal("LanguageModel", api);
  return api;
}

function session(text = "  Tip one. Tip two.  "): FakeSession {
  return {
    prompt: vi.fn().mockResolvedValue(text),
    destroy: vi.fn(),
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("checkBrowserAIAvailability", () => {
  it("reports unavailable when the browser has no Prompt API", async () => {
    vi.stubGlobal("LanguageModel", undefined);
    await expect(checkBrowserAIAvailability()).resolves.toBe("unavailable");
  });

  it("reports unavailable when the API has no availability method", async () => {
    installApi({ availability: undefined });
    await expect(checkBrowserAIAvailability()).resolves.toBe("unavailable");
  });

  it.each([
    ["available", "available"],
    ["readily", "available"],
    ["downloadable", "downloadable"],
    ["after-download", "downloadable"],
    ["downloading", "downloading"],
    ["unknown-status", "unavailable"],
  ])("maps %s to %s", async (status, expected) => {
    installApi({ availability: vi.fn().mockResolvedValue(status) });
    await expect(checkBrowserAIAvailability()).resolves.toBe(expected);
  });

  it("degrades to unavailable when availability() throws", async () => {
    installApi({ availability: vi.fn().mockRejectedValue(new Error("boom")) });
    await expect(checkBrowserAIAvailability()).resolves.toBe("unavailable");
  });
});

describe("runLocalBrowserCoach", () => {
  it("throws a clear error when the Prompt API is absent", async () => {
    vi.stubGlobal("LanguageModel", undefined);
    await expect(runLocalBrowserCoach("Q", "answer")).rejects.toThrow(
      /not available in this browser/i,
    );
  });

  it("throws when the API cannot create a session", async () => {
    installApi({ create: undefined });
    await expect(runLocalBrowserCoach("Q", "answer")).rejects.toThrow(
      /not available in this browser/i,
    );
  });

  it("requires a non-empty answer", async () => {
    const api = installApi();
    await expect(runLocalBrowserCoach("Q", "   ")).rejects.toThrow(
      /Add part of your answer/i,
    );
    expect(api.create).not.toHaveBeenCalled();
  });

  it("prompts with the question and trimmed answer, then destroys the session", async () => {
    const fake = session();
    installApi({ create: vi.fn().mockResolvedValue(fake) });

    const result = await runLocalBrowserCoach(
      "  Tell me about yourself  ",
      "  I built systems.  ",
    );

    expect(result).toBe("Tip one. Tip two.");
    expect(fake.prompt).toHaveBeenCalledOnce();
    const prompt = fake.prompt.mock.calls[0][0] as string;
    expect(prompt).toContain("Tell me about yourself");
    expect(prompt).toContain("I built systems.");
    expect(fake.destroy).toHaveBeenCalledOnce();
  });

  it("uses a fallback label when the question is blank", async () => {
    const fake = session("tip");
    installApi({ create: vi.fn().mockResolvedValue(fake) });

    await runLocalBrowserCoach("   ", "answer");

    expect(fake.prompt.mock.calls[0][0] as string).toContain(
      "General interview question",
    );
  });

  it("still destroys the session when prompt() fails", async () => {
    const fake = session();
    fake.prompt.mockRejectedValue(new Error("model failed"));
    installApi({ create: vi.fn().mockResolvedValue(fake) });

    await expect(runLocalBrowserCoach("Q", "answer")).rejects.toThrow(
      "model failed",
    );
    expect(fake.destroy).toHaveBeenCalledOnce();
  });
});
