/**
 * T3Code-inspired ModelManifest for JobPrep.
 *
 * Combines:
 *  - A Zod-validated bundled offline catalog (`BUNDLED_MODEL_MANIFEST`) so the
 *    app always boots cleanly with zero network dependency.
 *  - Optional TTL-cached remote manifest refresh (`MODEL_MANIFEST_URL`) with a
 *    stale-timestamp guard so new models, aliases, capabilities, and "new"
 *    badges roll out without an app redeploy (works on both Node.js and
 *    Cloudflare Workers).
 */
import { z } from "zod";

export const AI_PROVIDER_IDS = [
  "pollinations",
  "anthropic",
  "openai",
  "gemini",
  "openrouter",
  "ollama",
  "gateway",
] as const;

export type AIProviderId = (typeof AI_PROVIDER_IDS)[number];

export type ModelTier = "fast" | "balanced" | "reasoning";

export const modelCapabilitiesSchema = z.object({
  structuredOutput: z.boolean().default(true),
  streaming: z.boolean().default(true),
  reasoning: z.boolean().default(false),
  vision: z.boolean().default(false),
});

export type ModelCapabilities = z.infer<typeof modelCapabilitiesSchema>;

export const modelManifestEntrySchema = z.object({
  /** Stable id of the form "<provider>:<model>", e.g. "anthropic:claude-sonnet-4-5". */
  id: z.string().min(3),
  provider: z.enum(AI_PROVIDER_IDS),
  /** Provider-native model slug passed to the AI SDK adapter. */
  model: z.string().min(1),
  label: z.string().min(1),
  tier: z.enum(["fast", "balanced", "reasoning"]).default("balanced"),
  /** Whether the provider can run without a paid cloud API key. */
  local: z.boolean().default(false),
  contextWindow: z.number().int().positive().optional(),
  aliases: z.array(z.string()).optional(),
  releasedAt: z.string().optional(),
  status: z.enum(["current", "legacy"]).default("current"),
  capabilities: modelCapabilitiesSchema.default({
    structuredOutput: true,
    streaming: true,
    reasoning: false,
    vision: false,
  }),
});

export type ModelManifestEntry = z.infer<typeof modelManifestEntrySchema>;

export interface ResolvedModelCatalogItem extends ModelManifestEntry {
  badge?: "new";
  configured: boolean;
}

export const modelManifestSchema = z.object({
  version: z.number().int().positive().default(1),
  updatedAt: z.string(),
  defaults: z.object({
    chat: z.string(),
    fast: z.string(),
    reasoning: z.string(),
  }),
  models: z.array(modelManifestEntrySchema).min(1),
});

export type ModelManifestData = z.infer<typeof modelManifestSchema>;

const MODEL_NEW_BADGE_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const MANIFEST_TTL_MS = 60 * 60 * 1000; // 1 hour
const MANIFEST_FETCH_TIMEOUT_MS = 4_000;

export const BUNDLED_MODEL_MANIFEST: ModelManifestData = {
  version: 1,
  updatedAt: "2026-11-27T00:00:00.000Z",
  defaults: {
    chat: "pollinations:gpt-oss-20b",
    fast: "pollinations:gpt-oss-20b",
    reasoning: "anthropic:claude-sonnet-4-5",
  },
  models: [
    {
      id: "pollinations:gpt-oss-20b",
      provider: "pollinations",
      model: "gpt-oss-20b",
      label: "Pollinations · GPT-OSS 20B (Free, no key)",
      tier: "fast",
      local: true,
      contextWindow: 32_768,
      aliases: ["free", "default-free"],
      status: "current",
      capabilities: {
        structuredOutput: false,
        streaming: true,
        reasoning: false,
        vision: false,
      },
    },
    {
      id: "anthropic:claude-haiku-4-5",
      provider: "anthropic",
      model: "claude-haiku-4-5",
      label: "Claude Haiku 4.5 (fast)",
      tier: "fast",
      local: false,
      contextWindow: 200_000,
      aliases: ["claude-haiku", "haiku"],
      status: "current",
      capabilities: {
        structuredOutput: true,
        streaming: true,
        reasoning: false,
        vision: true,
      },
    },
    {
      id: "anthropic:claude-sonnet-4-5",
      provider: "anthropic",
      model: "claude-sonnet-4-5",
      label: "Claude Sonnet 4.5 (balanced)",
      tier: "reasoning",
      local: false,
      contextWindow: 200_000,
      aliases: ["claude-sonnet", "sonnet"],
      status: "current",
      capabilities: {
        structuredOutput: true,
        streaming: true,
        reasoning: true,
        vision: true,
      },
    },
    {
      id: "openai:gpt-4o-mini",
      provider: "openai",
      model: "gpt-4o-mini",
      label: "GPT-4o mini",
      tier: "fast",
      local: false,
      contextWindow: 128_000,
      aliases: ["gpt-mini"],
      status: "current",
      capabilities: {
        structuredOutput: true,
        streaming: true,
        reasoning: false,
        vision: true,
      },
    },
    {
      id: "openai:gpt-4o",
      provider: "openai",
      model: "gpt-4o",
      label: "GPT-4o",
      tier: "balanced",
      local: false,
      contextWindow: 128_000,
      aliases: ["gpt"],
      status: "current",
      capabilities: {
        structuredOutput: true,
        streaming: true,
        reasoning: false,
        vision: true,
      },
    },
    {
      id: "gemini:gemini-2.0-flash",
      provider: "gemini",
      model: "gemini-2.0-flash",
      label: "Gemini 2.0 Flash",
      tier: "fast",
      local: false,
      contextWindow: 1_000_000,
      aliases: ["gemini-flash", "gemini"],
      status: "current",
      capabilities: {
        structuredOutput: true,
        streaming: true,
        reasoning: false,
        vision: true,
      },
    },
    {
      id: "openrouter:anthropic/claude-sonnet-4.5",
      provider: "openrouter",
      model: "anthropic/claude-sonnet-4.5",
      label: "OpenRouter · Claude Sonnet 4.5",
      tier: "reasoning",
      local: false,
      contextWindow: 200_000,
      aliases: ["or-sonnet"],
      releasedAt: "2026-11-15T00:00:00.000Z",
      status: "current",
      capabilities: {
        structuredOutput: true,
        streaming: true,
        reasoning: true,
        vision: true,
      },
    },
    {
      id: "openrouter:google/gemini-2.5-flash",
      provider: "openrouter",
      model: "google/gemini-2.5-flash",
      label: "OpenRouter · Gemini 2.5 Flash",
      tier: "fast",
      local: false,
      contextWindow: 1_000_000,
      aliases: ["or-gemini"],
      releasedAt: "2026-11-15T00:00:00.000Z",
      status: "current",
      capabilities: {
        structuredOutput: true,
        streaming: true,
        reasoning: true,
        vision: true,
      },
    },
    {
      id: "openrouter:deepseek/deepseek-r1",
      provider: "openrouter",
      model: "deepseek/deepseek-r1",
      label: "OpenRouter · DeepSeek R1",
      tier: "reasoning",
      local: false,
      contextWindow: 128_000,
      aliases: ["deepseek-r1"],
      releasedAt: "2026-11-15T00:00:00.000Z",
      status: "current",
      capabilities: {
        structuredOutput: false,
        streaming: true,
        reasoning: true,
        vision: false,
      },
    },
    {
      id: "ollama:llama3.2",
      provider: "ollama",
      model: "llama3.2",
      label: "Ollama · Llama 3.2 (local / self-host)",
      tier: "balanced",
      local: true,
      contextWindow: 128_000,
      aliases: ["local", "ollama"],
      status: "current",
      capabilities: {
        structuredOutput: true,
        streaming: true,
        reasoning: false,
        vision: false,
      },
    },
  ],
};

let activeManifest: ModelManifestData = BUNDLED_MODEL_MANIFEST;
let lastFetchedAtMs: number | null = null;
let inFlightRefresh: Promise<ModelManifestData> | null = null;

function manifestUpdatedAtMs(data: ModelManifestData): number {
  const parsed = Date.parse(data.updatedAt);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function isProviderConfigured(provider: AIProviderId): boolean {
  switch (provider) {
    case "pollinations":
      return true;
    case "anthropic":
      return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
    case "openai":
      return Boolean(process.env.OPENAI_API_KEY?.trim());
    case "gemini":
      return Boolean(
        process.env.GEMINI_API_KEY?.trim() ||
          process.env.GOOGLE_API_KEY?.trim(),
      );
    case "openrouter":
      return Boolean(process.env.OPENROUTER_API_KEY?.trim());
    case "ollama":
      return Boolean(
        process.env.OLLAMA_HOST?.trim() ||
          process.env.OLLAMA_API_KEY?.trim() ||
          process.env.OLLAMA_MODEL?.trim(),
      );
    case "gateway":
      return Boolean(
        process.env.CF_AI_GATEWAY_URL?.trim() ||
          process.env.AI_GATEWAY_BASE_URL?.trim(),
      );
  }
}

export function getCurrentManifest(): ModelManifestData {
  return activeManifest;
}

/**
 * Refresh the in-memory manifest from `MODEL_MANIFEST_URL` if configured and
 * past its TTL. Rejects stale remote edits whose `updatedAt` predates the
 * active manifest (matching T3Code's `ModelManifest.ts` freshness invariant).
 */
export async function refreshModelManifest(
  force = false,
): Promise<ModelManifestData> {
  const manifestUrl = process.env.MODEL_MANIFEST_URL?.trim();
  if (!manifestUrl) return activeManifest;

  const now = Date.now();
  if (
    !force &&
    lastFetchedAtMs !== null &&
    now >= lastFetchedAtMs &&
    now - lastFetchedAtMs < MANIFEST_TTL_MS
  ) {
    return activeManifest;
  }

  if (inFlightRefresh) return inFlightRefresh;

  inFlightRefresh = (async () => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(
        () => controller.abort(),
        MANIFEST_FETCH_TIMEOUT_MS,
      );
      const res = await fetch(manifestUrl, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timer);

      if (!res.ok) return activeManifest;
      const raw = await res.json();
      const parsed = modelManifestSchema.safeParse(raw);
      if (!parsed.success) return activeManifest;

      if (
        manifestUpdatedAtMs(parsed.data) < manifestUpdatedAtMs(activeManifest)
      ) {
        return activeManifest;
      }

      activeManifest = parsed.data;
      lastFetchedAtMs = Date.now();
      return activeManifest;
    } catch {
      return activeManifest;
    } finally {
      inFlightRefresh = null;
    }
  })();

  return inFlightRefresh;
}

export function resolveModelCatalog(
  nowMs: number = Date.now(),
): ResolvedModelCatalogItem[] {
  return activeManifest.models.map((entry) => {
    const releasedAtMs = entry.releasedAt ? Date.parse(entry.releasedAt) : NaN;
    const isNew =
      entry.status === "current" &&
      !Number.isNaN(releasedAtMs) &&
      nowMs >= releasedAtMs &&
      nowMs - releasedAtMs < MODEL_NEW_BADGE_DURATION_MS;

    return {
      ...entry,
      ...(isNew ? { badge: "new" as const } : {}),
      configured: isProviderConfigured(entry.provider),
    };
  });
}

export function findManifestModel(
  idOrAlias: string,
): ModelManifestEntry | undefined {
  return activeManifest.models.find(
    (m) => m.id === idOrAlias || m.aliases?.includes(idOrAlias),
  );
}
