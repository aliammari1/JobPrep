/**
 * Central AI boundary for JobPrep (AI SDK 7).
 *
 * Every AI feature goes through this module (or `providers.ts` directly)
 * so model selection, timeouts, structured outputs, and telemetry come from
 * one system.
 *
 * - Model selection: single `<provider>:<model>` id via `resolveModel()`.
 * - Structured outputs: `generateText` with `Output.object({ schema })`
 *   (no deprecated `generateObject`), with a resilient JSON-prompt fallback
 *   for keyless OpenAI-compatible endpoints.
 * - Telemetry: `telemetry: { functionId }` on every call.
 */
import { generateText, Output, streamText } from "ai";
import type { z } from "zod";
import { DEFAULT_MODEL_ID, isKnownModel, resolveModel } from "./providers";

/** Default ceiling for a single AI call (ms). Routes can override per call. */
export const AI_DEFAULT_TIMEOUT_MS = 35_000;

export function resolveRequestModel(model: unknown): string {
  if (model === undefined) return DEFAULT_MODEL_ID;
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
  /** Model id of the form "<provider>:<model>". Defaults to DEFAULT_MODEL_ID. */
  modelId?: string;
  functionId: string;
  timeoutMs?: number;
  maxRetries?: number;
}

/**
 * Generate a Zod-validated structured object using AI SDK 7's
 * `generateText({ output: Output.object({ schema }) })`, falling back to
 * strict JSON text parsing when a free OpenAI-compatible provider does not
 * honor `json_schema` response_format.
 */
export async function generateStructured<T>(
  options: StructuredCallOptions<T>,
): Promise<T> {
  const modelId = options.modelId ?? DEFAULT_MODEL_ID;
  const timeoutMs = options.timeoutMs ?? AI_DEFAULT_TIMEOUT_MS;
  const model = resolveModel(modelId);

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

  // Keyless Pollinations lane does not expose OpenAI `json_schema` responseFormat;
  // go straight to strict JSON prompting to avoid AI SDK warnings and extra round-trips.
  if (modelId.startsWith("pollinations:")) {
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
  functionId: string;
  timeoutMs?: number;
  maxRetries?: number;
}

export async function generateModelText(
  options: TextCallOptions,
): Promise<string> {
  const modelId = options.modelId ?? DEFAULT_MODEL_ID;
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
  const modelId = options.modelId ?? DEFAULT_MODEL_ID;
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
