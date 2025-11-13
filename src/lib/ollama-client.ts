/**
 * Ollama Client for Local AI & API
 * Uses Vercel AI SDK with manual JSON parsing
 */

import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText, generateObject } from "ai";
import { z } from "zod";

// Determine if using local or API-based Ollama
const isLocalOllama = !process.env.OLLAMA_API_KEY;

const ollama = createOpenAICompatible({
  baseURL: process.env.OLLAMA_HOST || (isLocalOllama ? "http://localhost:11434/v1" : "https://ollama.com/v1"),
  apiKey: process.env.OLLAMA_API_KEY || "ollama", // Ollama doesn't require API key for local
  name: "ollama",
});

const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2:latest";

/**
 * Generate and validate JSON output using Vercel AI SDK + Zod
 * Uses generateText and then validates with schema
 */
export async function generateStructuredOutput<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
  systemPrompt?: string
): Promise<T> {
  try {
    const { text } = await generateText({
      model: ollama(OLLAMA_MODEL),
      prompt,
      system: systemPrompt,
    });

    // Clean and parse JSON
    const cleaned = cleanJsonResponse(text);
    const parsed = JSON.parse(cleaned);
    
    // Validate with schema
    return schema.parse(parsed);
  } catch (error) {
    console.error("Ollama generation error:", error);
    throw error;
  }
}

/**
 * Generate structured output with retry logic
 */
export async function generateStructuredOutputRetry<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
  systemPrompt?: string,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await generateStructuredOutput(prompt, schema, systemPrompt);
    } catch (error: any) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const delay = 1000 * Math.pow(2, attempt);
        console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * Clean JSON response from LLM output
 */
export function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();

  // Remove markdown code blocks
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

  // Extract JSON object/array if text has extra content
  if (!cleaned.startsWith("{") && !cleaned.startsWith("[")) {
    const jsonMatch = cleaned.match(/[\{\[][\s\S]*[\}\]]/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }
  }

  return cleaned;
}

// Legacy functions for backwards compatibility
export async function generateWithOllama(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const { text } = await generateText({
    model: ollama(OLLAMA_MODEL),
    prompt,
    system: systemPrompt,
  });
  return text;
}

export async function generateWithOllamaRetry(
  prompt: string,
  systemPrompt?: string,
  maxRetries: number = 2
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await generateWithOllama(prompt, systemPrompt);
    } catch (error: any) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const delay = 1000 * Math.pow(2, attempt);
        console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}