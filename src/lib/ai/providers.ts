/**
 * Provider-agnostic AI registry for the JobPrep AI Coach.
 *
 * JobPrep's AI features were previously hard-wired to a local Ollama endpoint.
 * This module consolidates model selection behind the Vercel AI SDK so any
 * route can resolve a language model by a single `model id` string and the user
 * (or env config) can swap providers — Claude, GPT, Gemini, or a local Ollama —
 * without touching call sites.
 *
 * Adding a provider only requires:
 *   1. installing its `@ai-sdk/*` package,
 *   2. adding an entry to `PROVIDERS`,
 *   3. listing its models in `AI_MODELS`.
 */
import "./env-guard";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";

export type AIProviderId =
  | "pollinations"
  | "anthropic"
  | "openai"
  | "gemini"
  | "ollama";

export interface AIModelDescriptor {
  /** Stable id used by the API + UI, e.g. "pollinations:gpt-oss-20b". */
  id: string;
  provider: AIProviderId;
  /** The provider-native model name passed to the SDK. */
  model: string;
  label: string;
  /** Whether the provider can run without a cloud API key (Pollinations free or local Ollama). */
  local: boolean;
}

/**
 * Default coach model. Configurable via AI_COACH_DEFAULT_MODEL.
 * Defaults to Pollinations' free keyless OpenAI-compatible lane so JobPrep
 * works out of the box with zero API keys configured.
 */
export const DEFAULT_MODEL_ID =
  process.env.AI_COACH_DEFAULT_MODEL || "pollinations:gpt-oss-20b";

export const AI_MODELS: AIModelDescriptor[] = [
  {
    id: "pollinations:gpt-oss-20b",
    provider: "pollinations",
    model: "gpt-oss-20b",
    label: "Pollinations · GPT-OSS 20B (Free, no key)",
    local: true,
  },
  {
    id: "anthropic:claude-haiku-4-5",
    provider: "anthropic",
    model: "claude-haiku-4-5",
    label: "Claude Haiku 4.5 (fast)",
    local: false,
  },
  {
    id: "anthropic:claude-sonnet-4-5",
    provider: "anthropic",
    model: "claude-sonnet-4-5",
    label: "Claude Sonnet 4.5 (balanced)",
    local: false,
  },
  {
    id: "openai:gpt-4o-mini",
    provider: "openai",
    model: "gpt-4o-mini",
    label: "GPT-4o mini",
    local: false,
  },
  {
    id: "openai:gpt-4o",
    provider: "openai",
    model: "gpt-4o",
    label: "GPT-4o",
    local: false,
  },
  {
    id: "gemini:gemini-2.0-flash",
    provider: "gemini",
    model: "gemini-2.0-flash",
    label: "Gemini 2.0 Flash",
    local: false,
  },
  {
    id: "ollama:llama3.2",
    provider: "ollama",
    model: "llama3.2",
    label: "Ollama · Llama 3.2 (local / self-host)",
    local: true,
  },
];

/** Parse a model id of the form "<provider>:<model>". */
export function parseModelId(modelId: string): {
  provider: AIProviderId;
  model: string;
} {
  const idx = modelId.indexOf(":");
  if (idx === -1) {
    throw new Error(
      `Invalid model id "${modelId}". Expected "<provider>:<model>".`,
    );
  }
  const provider = modelId.slice(0, idx) as AIProviderId;
  const model = modelId.slice(idx + 1);
  if (!model) {
    throw new Error(`Invalid model id "${modelId}". Missing model name.`);
  }
  return { provider, model };
}

export function isKnownModel(modelId: string): boolean {
  return AI_MODELS.some((m) => m.id === modelId);
}

/**
 * Resolve a `LanguageModel` instance for a given model id, wiring the correct
 * provider + credentials from the environment.
 */
export function resolveModel(
  modelId: string = DEFAULT_MODEL_ID,
): LanguageModel {
  const { provider, model } = parseModelId(modelId);

  switch (provider) {
    case "pollinations": {
      const pollinations = createOpenAICompatible({
        name: "pollinations",
        baseURL:
          process.env.POLLINATIONS_BASE_URL ||
          "https://text.pollinations.ai/openai",
        apiKey: process.env.POLLINATIONS_API_KEY || "anonymous",
      });
      return pollinations(model);
    }
    case "anthropic": {
      const anthropic = createAnthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
      return anthropic(model);
    }
    case "openai": {
      const openai = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        // AI SDK v4 rejects an empty-string baseURL, and `.env` files
        // commonly carry `OPENAI_BASE_URL=` (empty). Fall back to the
        // provider default unless a real URL is configured.
        baseURL: process.env.OPENAI_BASE_URL || undefined,
      });
      return openai(model);
    }
    case "gemini": {
      // Gemini exposes an OpenAI-compatible endpoint.
      const gemini = createOpenAICompatible({
        name: "gemini",
        baseURL:
          process.env.GEMINI_BASE_URL ||
          "https://generativelanguage.googleapis.com/v1beta/openai",
        apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "",
      });
      return gemini(model);
    }
    case "ollama": {
      const isLocal = !process.env.OLLAMA_API_KEY;
      const ollama = createOpenAICompatible({
        name: "ollama",
        baseURL:
          process.env.OLLAMA_HOST ||
          (isLocal ? "http://localhost:11434/v1" : "https://ollama.com/v1"),
        apiKey: process.env.OLLAMA_API_KEY || "ollama",
      });
      return ollama(model);
    }
    default: {
      throw new Error(`Unsupported AI provider: "${provider}".`);
    }
  }
}
