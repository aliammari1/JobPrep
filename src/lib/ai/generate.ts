/**
 * Central AI boundary for JobPrep (AI SDK 7 + T3Code-style ModelManifest).
 *
 * Every AI feature goes through this module (or `providers.ts` directly)
 * so model selection, tier routing (`fast` | `balanced` | `reasoning`),
 * capability-aware structured outputs, timeouts, and telemetry come from
 * one system.
 */
import { generateText, Output, streamText } from "ai";
import type { z } from "zod";
import { findManifestModel } from "./model-manifest";
import {
  DEFAULT_MODEL_ID,
  isKnownModel,
  type ModelTier,
  resolveModel,
  resolveModelIdForTier,
} from "./providers";

/** Default ceiling for a single AI call (ms). Routes can override per call. */
export const AI_DEFAULT_TIMEOUT_MS = 35_000;

export function resolveRequestModel(
  model: unknown,
  tier: ModelTier = "balanced",
): string {
  if (model === undefined || model === null || model === "") {
    return tier === "balanced" ? DEFAULT_MODEL_ID : resolveModelIdForTier(tier);
  }
  if (typeof model !== "string" || !isKnownModel(model)) {
    throw new Error(`Unknown model: ${String(model)}`);
  }
  return model;
}

export function aiTelemetry(functionId: string, _modelId?: string) {
  return {
    functionId,
  } as const;
}

function extractJsonText(raw: string): string {
  let cleaned = raw.trim();
  const fenced =
    cleaned.match(/```json\s*([\s\S]*?)\s*```/i) ??
    cleaned.match(/```\s*([\s\S]*?)\s*```/);
  if (fenced?.[1]) {
    cleaned = fenced[1].trim();
  }
  if (!cleaned.startsWith("{") && !cleaned.startsWith("[")) {
    const match = cleaned.match(/[{[][\s\S]*[}\]]/);
    if (match) cleaned = match[0];
  }
  return cleaned;
}

export interface StructuredCallOptions<T> {
  schema: z.ZodType<T>;
  prompt: string;
  instructions?: string;
  /** Model id of the form "<provider>:<model>" (or manifest alias). */
  modelId?: string;
  /** Optional routing tier when no explicit modelId is provided. */
  tier?: ModelTier;
  functionId: string;
  timeoutMs?: number;
  maxRetries?: number;
}

/**
 * Generate a Zod-validated structured object using AI SDK 7's
 * `generateText({ output: Output.object({ schema }) })`, falling back to
 * strict JSON text parsing when the manifest marks a model as lacking native
 * `json_schema` support (or if a provider rejects `response_format`).
 */
export async function generateStructured<T>(
  options: StructuredCallOptions<T>,
): Promise<T> {
  const modelId =
    options.modelId ??
    (options.tier ? resolveModelIdForTier(options.tier) : DEFAULT_MODEL_ID);
  const timeoutMs = options.timeoutMs ?? AI_DEFAULT_TIMEOUT_MS;
  const model = resolveModel(modelId);
  const manifestEntry = findManifestModel(modelId);

  const runJsonTextFallback = async (): Promise<T> => {
    const { text } = await generateText({
      model,
      system: [
        options.instructions,
        "You MUST respond with ONLY a single valid JSON object (no markdown fences, no commentary) matching the requested fields.",
      ]
        .filter(Boolean)
        .join("\n\n"),
      prompt: options.prompt,
      telemetry: aiTelemetry(`${options.functionId}-json`, modelId),
      maxRetries: 1,
      timeout: timeoutMs,
    });
    const parsed = JSON.parse(extractJsonText(text));
    return options.schema.parse(parsed);
  };

  const supportsNativeStructured =
    manifestEntry?.capabilities.structuredOutput ??
    !modelId.startsWith("pollinations:");

  if (!supportsNativeStructured) {
    return runJsonTextFallback();
  }

  try {
    const result = await generateText({
      model,
      output: Output.object({ schema: options.schema }),
      ...(options.instructions !== undefined
        ? { system: options.instructions }
        : {}),
      prompt: options.prompt,
      telemetry: aiTelemetry(options.functionId, modelId),
      maxRetries: options.maxRetries ?? 1,
      timeout: timeoutMs,
    });
    return result.output as T;
  } catch {
    return runJsonTextFallback();
  }
}

export interface TextCallOptions {
  prompt: string;
  instructions?: string;
  modelId?: string;
  tier?: ModelTier;
  functionId: string;
  timeoutMs?: number;
  maxRetries?: number;
}

export async function generateModelText(
  options: TextCallOptions,
): Promise<string> {
  const modelId =
    options.modelId ??
    (options.tier ? resolveModelIdForTier(options.tier) : DEFAULT_MODEL_ID);
  const { text } = await generateText({
    model: resolveModel(modelId),
    ...(options.instructions !== undefined
      ? { system: options.instructions }
      : {}),
    prompt: options.prompt,
    telemetry: aiTelemetry(options.functionId, modelId),
    maxRetries: options.maxRetries ?? 2,
    timeout: options.timeoutMs ?? AI_DEFAULT_TIMEOUT_MS,
  });
  return text;
}

/**
 * Stream a text reply. Returns the `streamText` result so routes can call
 * `.toTextStreamResponse()`.
 */
export function streamModelText(options: TextCallOptions) {
  const modelId =
    options.modelId ??
    (options.tier ? resolveModelIdForTier(options.tier) : DEFAULT_MODEL_ID);
  return streamText({
    model: resolveModel(modelId),
    ...(options.instructions !== undefined
      ? { system: options.instructions }
      : {}),
    prompt: options.prompt,
    telemetry: aiTelemetry(options.functionId, modelId),
    maxRetries: options.maxRetries ?? 2,
    timeout: options.timeoutMs ?? AI_DEFAULT_TIMEOUT_MS,
  });
}
