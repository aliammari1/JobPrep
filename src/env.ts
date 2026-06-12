/**
 * Typed, validated environment configuration (boot-time).
 *
 * Replaces the hand-rolled `src/lib/env-validation.ts` runtime checker with a
 * single source of truth built on `@t3-oss/env-nextjs` + Zod. Server-only
 * secrets are never exposed to the client bundle; `NEXT_PUBLIC_*` vars are.
 *
 * Most provider keys are OPTIONAL by design — JobPrep is BYOK (bring-your-own-
 * key) and self-hostable, so a contributor can run the app with only a database
 * + auth secret and wire AI/video/billing in later. Set `SKIP_ENV_VALIDATION=1`
 * to bypass validation entirely (used by CI builds and `next lint`).
 */
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Server-side variables. Not available in the browser; importing one in a
   * client component is a build-time error.
   */
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    // --- Database (required) ---
    DATABASE_URL: z.string().url(),
    POSTGRES_PRISMA_URL: z.string().url().optional(),

    // --- Auth (required) ---
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().url().optional(),
    APP_NAME: z.string().optional(),

    // --- AI providers (BYOK — at least one recommended, none required) ---
    AI_COACH_DEFAULT_MODEL: z.string().optional(),
    ANTHROPIC_API_KEY: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    OPENAI_BASE_URL: z.string().url().optional(),
    OPENAI_MODEL: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),
    GEMINI_BASE_URL: z.string().url().optional(),
    GOOGLE_API_KEY: z.string().optional(),
    OLLAMA_HOST: z.string().optional(),
    OLLAMA_API_KEY: z.string().optional(),
    OLLAMA_MODEL: z.string().optional(),

    // --- Live video (LiveKit / avatar) ---
    LIVEKIT_URL: z.string().optional(),
    LIVEKIT_API_KEY: z.string().optional(),
    LIVEKIT_API_SECRET: z.string().optional(),
    SIMLI_API_KEY: z.string().optional(),
    SIMLI_FACE_ID: z.string().optional(),
    HEYGEN_API_KEY: z.string().optional(),

    // --- Billing (Stripe) ---
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),

    // --- Rate limiting (Upstash Redis; optional — falls back to no-op) ---
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

    // --- Observability (Sentry; optional) ---
    SENTRY_DSN: z.string().optional(),
    SENTRY_AUTH_TOKEN: z.string().optional(),

    // --- Email ---
    GMAIL_USER_EMAIL: z.string().optional(),
    GMAIL_APP_PASSWORD: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    RESEND_FROM_EMAIL: z.string().optional(),

    // --- Integrations ---
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    JUDGE0_API_URL: z.string().optional(),
    JUDGE0_API_KEY: z.string().optional(),
  },

  /**
   * Client-side variables. MUST be prefixed with `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    NEXT_PUBLIC_LIVEKIT_URL: z.string().optional(),
    NEXT_PUBLIC_SIMLI_API_KEY: z.string().optional(),
    NEXT_PUBLIC_SIMLI_FACE_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
    NEXT_PUBLIC_APPWRITE_PROJECT_ID: z.string().optional(),
    NEXT_PUBLIC_APPWRITE_ENDPOINT: z.string().url().optional(),
    NEXT_PUBLIC_APPWRITE_DATABASE_ID: z.string().optional(),
  },

  /**
   * Next.js bundles `process.env` statically, so client vars must be destructured
   * explicitly. Server vars can be read straight from `process.env`.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    APP_NAME: process.env.APP_NAME,
    AI_COACH_DEFAULT_MODEL: process.env.AI_COACH_DEFAULT_MODEL,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_BASE_URL: process.env.GEMINI_BASE_URL,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    OLLAMA_HOST: process.env.OLLAMA_HOST,
    OLLAMA_API_KEY: process.env.OLLAMA_API_KEY,
    OLLAMA_MODEL: process.env.OLLAMA_MODEL,
    LIVEKIT_URL: process.env.LIVEKIT_URL,
    LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY,
    LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET,
    SIMLI_API_KEY: process.env.SIMLI_API_KEY,
    SIMLI_FACE_ID: process.env.SIMLI_FACE_ID,
    HEYGEN_API_KEY: process.env.HEYGEN_API_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    GMAIL_USER_EMAIL: process.env.GMAIL_USER_EMAIL,
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    JUDGE0_API_URL: process.env.JUDGE0_API_URL,
    JUDGE0_API_KEY: process.env.JUDGE0_API_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_LIVEKIT_URL: process.env.NEXT_PUBLIC_LIVEKIT_URL,
    NEXT_PUBLIC_SIMLI_API_KEY: process.env.NEXT_PUBLIC_SIMLI_API_KEY,
    NEXT_PUBLIC_SIMLI_FACE_ID: process.env.NEXT_PUBLIC_SIMLI_FACE_ID,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_APPWRITE_PROJECT_ID:
      process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    NEXT_PUBLIC_APPWRITE_ENDPOINT: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
    NEXT_PUBLIC_APPWRITE_DATABASE_ID:
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
  },

  /**
   * Skip validation (CI builds, Docker, lint) — placeholders are accepted.
   */
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION || process.env.NODE_ENV === "test",

  /** Treat empty strings as undefined (a common .env footgun). */
  emptyStringAsUndefined: true,
});
