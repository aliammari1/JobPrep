/**
 * Ollama Client for Local AI & API
 * Supports both local Ollama and Ollama API (ollama.com)
 */

import { Ollama } from "ollama";

// Determine if using local or API-based Ollama
const isLocalOllama = !process.env.OLLAMA_API_KEY;

const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || (isLocalOllama ? "http://localhost:11434" : "https://ollama.com"),
  ...(process.env.OLLAMA_API_KEY && {
    headers: {
      Authorization: "Bearer " + process.env.OLLAMA_API_KEY,
    },
  }),
});

const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2:latest";

interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

export async function generateWithOllama(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  try {
    const response = await ollama.chat({
      model: OLLAMA_MODEL,
      messages: [
        ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
        { role: "user" as const, content: prompt },
      ],
      stream: false,
    });

    // Handle the response object
    if (typeof response === "string") {
      return response;
    }

    if (response && typeof response === "object" && "message" in response) {
      return (response as any).message.content;
    }

    return "";
  } catch (error) {
    console.error("Ollama generation error:", error);
    throw error;
  }
}

export async function* generateWithOllamaStream(
  prompt: string,
  systemPrompt?: string
): AsyncGenerator<string, void, unknown> {
  try {
    const response = await ollama.chat({
      model: OLLAMA_MODEL,
      messages: [
        ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
        { role: "user" as const, content: prompt },
      ],
      stream: true,
    });

    // For streaming responses
    for await (const part of response) {
      if (part.message?.content) {
        yield part.message.content;
      }
    }
  } catch (error) {
    console.error("Ollama streaming error:", error);
    throw error;
  }
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

// Helper to clean JSON from LLM responses
/**
 * Clean JSON response from LLM output
 * Removes markdown code blocks and extracts JSON
 */
export function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();

  // Remove markdown code blocks
  if (cleaned.includes("```json")) {
    const jsonMatch = cleaned.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      cleaned = jsonMatch[1].trim();
    }
  } else if (cleaned.includes("```")) {
    const codeMatch = cleaned.match(/```\s*([\s\S]*?)\s*```/);
    if (codeMatch && codeMatch[1]) {
      cleaned = codeMatch[1].trim();
    }
  }

  // Extract JSON object if text has extra content
  if (!cleaned.startsWith("{") && !cleaned.startsWith("[")) {
    const jsonMatch = cleaned.match(/[\{\[][\s\S]*[\}\]]/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }
  }

  // Fix common JSON issues from LLM output
  cleaned = fixMalformedJson(cleaned);

  return cleaned;
}

/**
 * Attempt to repair malformed JSON from LLM
 */
function fixMalformedJson(text: string): string {
  let fixed = text;

  // Fix unterminated strings by adding quotes before closing brackets
  fixed = fixed.replace(/":\s*"([^"]*?)([,\n\s]*[}\]])/g, '":" "$1"$2');

  // Fix missing commas between objects/arrays
  fixed = fixed.replace(/}(\s*{)/g, '},$1');
  fixed = fixed.replace(/](\s*\[)/g, '],$1');
  fixed = fixed.replace(/}(\s*\[)/g, '},$1');
  fixed = fixed.replace(/](\s*{)/g, '],$1');

  // Fix trailing commas before closing brackets
  fixed = fixed.replace(/,(\s*[}\]])/g, '$1');

  // Remove control characters
  fixed = fixed.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

  // Try to balance brackets
  let openBraces = (fixed.match(/{/g) || []).length;
  let closeBraces = (fixed.match(/}/g) || []).length;
  if (openBraces > closeBraces) {
    fixed += '}'.repeat(openBraces - closeBraces);
  }

  let openBrackets = (fixed.match(/\[/g) || []).length;
  let closeBrackets = (fixed.match(/]/g) || []).length;
  if (openBrackets > closeBrackets) {
    fixed += ']'.repeat(openBrackets - closeBrackets);
  }

  return fixed;
}