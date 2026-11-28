/**
 * Unified AI SDK v7 Provider Registry for JobPrep.
 *
 * Combines T3Code's `ModelManifest` catalog with Vercel AI SDK v7's native
 * `createProviderRegistry` so every AI route resolves any `<provider>:<model>`
 * id (or alias) through a single typed registry — supporting Anthropic,
 * OpenAI, Gemini, OpenRouter (300+ models on 1 BYOK key), Ollama (local),
 * Pollinations (free keyless), and any custom OpenAI-compatible gateway
 * (Portkey / LiteLLM / vLLM).
 */
import "./env-guard";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createProviderRegistry, type LanguageModel } from "ai";
import {
  AI_PROVIDER_IDS,
  type AIProviderId,
  BUNDLED_MODEL_MANIFEST,
  findManifestModel,
  getCurrentManifest,
  isProviderConfigured,
  type ModelManifestEntry,
  type ModelTier,
} from "./model-manifest";

export type { AIProviderId, ModelTier } from "./model-manifest";
export {
  getCurrentManifest,
  isProviderConfigured,
  refreshModelManifest,
  resolveModelCatalog,
} from "./model-manifest";

export type AIModelDescriptor = ModelManifestEntry;

/**
 * Default coach model. Configurable via AI_COACH_DEFAULT_MODEL.
 * Defaults to Pollinations' free keyless OpenAI-compatible lane so JobPrep
 * works out of the box with zero API keys configured.
 */
export const DEFAULT_MODEL_ID =
  process.env.AI_COACH_DEFAULT_MODEL || BUNDLED_MODEL_MANIFEST.defaults.chat;

/**
 * Fast/lightweight model for low-latency tasks (titles, hints, quick parsing).
 * Configurable via AI_COACH_SMALL_MODEL; falls back to DEFAULT_MODEL_ID.
 */
export const SMALL_MODEL_ID =
  process.env.AI_COACH_SMALL_MODEL || DEFAULT_MODEL_ID;

export const AI_MODELS: AIModelDescriptor[] = BUNDLED_MODEL_MANIFEST.models;

const SUPPORTED_PROVIDERS = new Set<string>(AI_PROVIDER_IDS);
const DYNAMIC_MODEL_PROVIDERS = new Set<AIProviderId>([
  "openrouter",
  "ollama",
  "gateway",
]);

/** Parse a model id of the form "<provider>:<model>" (or resolve a manifest alias). */
export function parseModelId(modelId: string): {
  provider: AIProviderId;
  model: string;
} {
  const aliased = findManifestModel(modelId);
  const canonical = aliased ? aliased.id : modelId;

  const idx = canonical.indexOf(":");
  if (idx === -1) {
    throw new Error(
      `Invalid model id "${modelId}". Expected "<provider>:<model>".`,
    );
  }
  const provider = canonical.slice(0, idx);
  const model = canonical.slice(idx + 1);
  if (!model) {
    throw new Error(`Invalid model id "${modelId}". Missing model name.`);
  }
  if (!SUPPORTED_PROVIDERS.has(provider)) {
    throw new Error(`Unsupported AI provider: "${provider}".`);
  }
  return { provider: provider as AIProviderId, model };
}

export function isKnownModel(modelId: string): boolean {
  const manifest = getCurrentManifest();
  if (
    manifest.models.some(
      (m) => m.id === modelId || m.aliases?.includes(modelId),
    )
  ) {
    return true;
  }

  // Allow any `<provider>:<model>` slug for dynamic routers (OpenRouter, Ollama, Gateway)
  try {
    const { provider } = parseModelId(modelId);
    return DYNAMIC_MODEL_PROVIDERS.has(provider);
  } catch {
    return false;
  }
}

/**
 * Build a Vercel AI SDK v7 `ProviderRegistry` wired to current env credentials.
 */
export function getProviderRegistry() {
  const isLocalOllama = !process.env.OLLAMA_API_KEY;

  return createProviderRegistry(
    {
      pollinations: createOpenAICompatible({
        name: "pollinations",
        baseURL:
          process.env.POLLINATIONS_BASE_URL ||
          "https://text.pollinations.ai/openai",
        apiKey: process.env.POLLINATIONS_API_KEY || "anonymous",
      }),
      anthropic: createAnthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      }),
      openai: createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_BASE_URL || undefined,
      }),
      gemini: createOpenAICompatible({
        name: "gemini",
        baseURL:
          process.env.GEMINI_BASE_URL ||
          "https://generativelanguage.googleapis.com/v1beta/openai",
        apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "",
      }),
      openrouter: createOpenAICompatible({
        name: "openrouter",
        baseURL:
          process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY || "",
        headers: {
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": process.env.APP_NAME || "JobPrep",
        },
      }),
      ollama: createOpenAICompatible({
        name: "ollama",
        baseURL:
          process.env.OLLAMA_HOST ||
          (isLocalOllama
            ? "http://localhost:11434/v1"
            : "https://ollama.com/v1"),
        apiKey: process.env.OLLAMA_API_KEY || "ollama",
      }),
      gateway: createOpenAICompatible({
        name: "gateway",
        baseURL:
          process.env.CF_AI_GATEWAY_URL ||
          process.env.AI_GATEWAY_BASE_URL ||
          "http://localhost:8787/v1",
        apiKey:
          process.env.CF_AI_GATEWAY_TOKEN ||
          process.env.AI_GATEWAY_API_KEY ||
          "gateway",
      }),
    },
    { separator: ":" },
  );
}

/**
 * Pick the best configured model for a requested tier ("fast" | "balanced" | "reasoning").
 * Respects explicit env defaults first, then selects the first configured model
 * in the manifest matching that tier, and falls back to `DEFAULT_MODEL_ID`.
 */
export function resolveModelIdForTier(tier: ModelTier = "balanced"): string {
  if (tier === "fast" && process.env.AI_COACH_SMALL_MODEL) {
    return process.env.AI_COACH_SMALL_MODEL;
  }
  if (process.env.AI_COACH_DEFAULT_MODEL) {
    return process.env.AI_COACH_DEFAULT_MODEL;
  }

  const manifest = getCurrentManifest();
  const preferred = manifest.models.find(
    (m) => m.tier === tier && !m.local && isProviderConfigured(m.provider),
  );
  if (preferred) return preferred.id;

  return tier === "fast" ? SMALL_MODEL_ID : DEFAULT_MODEL_ID;
}

/**
 * Resolve a Vercel AI SDK `LanguageModel` instance for any `<provider>:<model>`
 * id (or manifest alias) through `createProviderRegistry`.
 */
export function resolveModel(
  modelId: string = DEFAULT_MODEL_ID,
): LanguageModel {
  const { provider, model } = parseModelId(modelId);
  const registry = getProviderRegistry();
  return registry.languageModel(`${provider}:${model}`);
}
