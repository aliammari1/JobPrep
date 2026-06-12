import { NextResponse } from "next/server";
import { AI_MODELS, DEFAULT_MODEL_ID } from "@/lib/ai/providers";

/**
 * Lists the AI Coach models available to the in-product model picker.
 * Returns only metadata (no secrets); availability of cloud providers depends
 * on the corresponding API key being configured server-side.
 */
export function GET() {
  return NextResponse.json({
    defaultModelId: DEFAULT_MODEL_ID,
    models: AI_MODELS.map(({ id, provider, label, local }) => ({
      id,
      provider,
      label,
      local,
    })),
  });
}
