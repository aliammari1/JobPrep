/**
 * AI provider env normalization.
 *
 * MUST be the first import in `providers.ts` (before any `@ai-sdk/*`
 * import). AI SDK v4 provider packages create default instances at import
 * time from environment variables, and `validateBaseURL` rejects empty
 * strings. `.env` files commonly carry `OPENAI_BASE_URL=` (empty), which
 * would otherwise crash module evaluation with
 * `AI_InvalidArgumentError: baseURL must be a non-empty string` — even in
 * routes that never use OpenAI.
 *
 * Normalizing `""` → unset keeps "not configured" meaning "not configured".
 */
const EMPTY_SENSITIVE_VARS = [
  "OPENAI_BASE_URL",
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
  "ANTHROPIC_BASE_URL",
  "GEMINI_API_KEY",
  "GEMINI_BASE_URL",
  "GOOGLE_API_KEY",
  "OLLAMA_HOST",
  "OLLAMA_API_KEY",
] as const;

for (const key of EMPTY_SENSITIVE_VARS) {
  const value = process.env[key];
  if (value !== undefined && value.trim() === "") {
    delete process.env[key];
  }
}

export {};
