/**
 * Legacy Ollama helpers, reimplemented on top of the central AI boundary.
 *
 * Older routes import `generateWithOllamaRetry` /
 * `generateStructuredOutputRetry` from this module. Those helpers now resolve
 * the configured `DEFAULT_MODEL_ID` (which defaults to Pollinations' free
 * keyless endpoint) through `src/lib/ai/generate.ts` so every AI route works
 * with zero API keys and zero deprecated `generateObject` calls.
 */

import type { z } from "zod";
import { generateModelText, generateStructured } from "./ai/generate";
import { DEFAULT_MODEL_ID } from "./ai/providers";

const DEFAULT_LEGACY_MODEL_ID = DEFAULT_MODEL_ID;

/**
 * Generate and validate JSON output using the AI SDK + Zod.
 */
export async function generateStructuredOutput<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
  systemPrompt?: string,
  modelId: string = DEFAULT_LEGACY_MODEL_ID,
): Promise<T> {
  return generateStructured({
    prompt,
    schema,
    instructions: systemPrompt,
    modelId,
    functionId: "ollama-structured-output",
  });
}

/**
 * Generate structured output with retry logic
 */
export async function generateStructuredOutputRetry<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
  systemPrompt?: string,
  maxRetries: number = 2,
  modelId: string = DEFAULT_LEGACY_MODEL_ID,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await generateStructuredOutput(
        prompt,
        schema,
        systemPrompt,
        modelId,
      );
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const delay = 1000 * 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("Max retries exceeded");
}

/**
 * Clean JSON response from LLM output
 */
export function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();

  if (cleaned.includes("```json")) {
    const jsonMatch = cleaned.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch?.[1]) {
      cleaned = jsonMatch[1].trim();
    }
  } else if (cleaned.includes("```")) {
    const codeMatch = cleaned.match(/```\s*([\s\S]*?)\s*```/);
    if (codeMatch?.[1]) {
      cleaned = codeMatch[1].trim();
    }
  }

  if (!cleaned.startsWith("{") && !cleaned.startsWith("[")) {
    const jsonMatch = cleaned.match(/[{[][\s\S]*[}\]]/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }
  }

  return cleaned;
}

export async function generateWithOllama(
  prompt: string,
  systemPrompt?: string,
  modelId: string = DEFAULT_LEGACY_MODEL_ID,
): Promise<string> {
  return generateModelText({
    prompt,
    instructions: systemPrompt,
    modelId,
    functionId: "ollama-generate",
  });
}

export async function generateWithOllamaRetry(
  prompt: string,
  systemPrompt?: string,
  maxRetries: number = 2,
  modelId: string = DEFAULT_LEGACY_MODEL_ID,
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await generateWithOllama(prompt, systemPrompt, modelId);
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const delay = 1000 * 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("Max retries exceeded");
}
