/**
 * Ollama Client for Local AI
 * Much faster than Gemini API - runs locally!
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:latest';

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
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data: OllamaResponse = await response.json();
    return data.response;
  } catch (error) {
    console.error('Ollama generation error:', error);
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
  if (!cleaned.startsWith("{")) {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }
  }

  // Remove any trailing commas before closing braces/brackets
  cleaned = cleaned.replace(/,(\s*[}\]])/g, "$1");

  // Fix common JSON issues
  cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, ""); // Remove control characters

  // Fix unterminated strings by closing incomplete JSON objects
  try {
    JSON.parse(cleaned);
  } catch (e) {
    // If parsing fails, try to fix common issues
    // Add missing closing bracket if needed
    const openBraces = (cleaned.match(/\{/g) || []).length;
    const closeBraces = (cleaned.match(/\}/g) || []).length;
    if (openBraces > closeBraces) {
      cleaned += "}".repeat(openBraces - closeBraces);
    }

    const openBrackets = (cleaned.match(/\[/g) || []).length;
    const closeBrackets = (cleaned.match(/\]/g) || []).length;
    if (openBrackets > closeBrackets) {
      cleaned += "]".repeat(openBrackets - closeBrackets);
    }

    // Remove trailing incomplete properties
    // Look for incomplete string values or property names
    cleaned = cleaned.replace(/,?\s*"[^"]*$/, "");
    
    // Ensure proper closing
    if (!cleaned.endsWith("}") && !cleaned.endsWith("]")) {
      if (cleaned.includes("{")) cleaned += "}";
    }
  }

  return cleaned;
}