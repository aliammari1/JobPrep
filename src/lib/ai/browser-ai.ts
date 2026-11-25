/**
 * Type-safe wrapper for Chrome's built-in on-device Prompt API (`globalThis.LanguageModel`).
 */

export type BrowserAIAvailability =
  | "available"
  | "downloadable"
  | "downloading"
  | "unavailable";

interface BrowserLanguageModelSession {
  prompt: (input: string) => Promise<string>;
  destroy?: () => void;
}

interface BrowserLanguageModelCreateOptions {
  systemPrompt?: string;
}

interface BrowserLanguageModelAPI {
  availability?: () => Promise<string>;
  create?: (
    options?: BrowserLanguageModelCreateOptions,
  ) => Promise<BrowserLanguageModelSession>;
}

interface GlobalWithLanguageModel {
  LanguageModel?: BrowserLanguageModelAPI;
}

function getLanguageModelAPI(): BrowserLanguageModelAPI | null {
  if (typeof globalThis === "undefined") return null;
  const candidate = (globalThis as GlobalWithLanguageModel).LanguageModel;
  return candidate && typeof candidate === "object" ? candidate : null;
}

export async function checkBrowserAIAvailability(): Promise<BrowserAIAvailability> {
  const api = getLanguageModelAPI();
  if (!api || typeof api.availability !== "function") {
    return "unavailable";
  }

  try {
    const status = await api.availability();
    switch (status) {
      case "available":
      case "readily":
        return "available";
      case "downloadable":
      case "after-download":
        return "downloadable";
      case "downloading":
        return "downloading";
      default:
        return "unavailable";
    }
  } catch {
    return "unavailable";
  }
}

export async function runLocalBrowserCoach(
  question: string,
  answer: string,
): Promise<string> {
  const api = getLanguageModelAPI();
  if (!api || typeof api.create !== "function") {
    throw new Error(
      "Chrome Built-in AI (LanguageModel) is not available in this browser.",
    );
  }

  const trimmedAnswer = answer.trim();
  if (!trimmedAnswer) {
    throw new Error("Add part of your answer first to get a local AI tip.");
  }

  const session = await api.create({
    systemPrompt:
      "You are a concise, direct interview coach. Given an interview question and a candidate's draft answer, return 2 short actionable tips (under 50 words total) focused on STAR clarity and measurable impact. Avoid generic praise.",
  });

  try {
    const promptText = `Interview Question:\n${question.trim() || "General interview question"}\n\nCandidate Draft Answer:\n${trimmedAnswer}\n\nGive 2 crisp, actionable coaching tips:`;
    const result = await session.prompt(promptText);
    return result.trim();
  } finally {
    session.destroy?.();
  }
}
