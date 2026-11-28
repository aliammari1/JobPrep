import { NextResponse } from "next/server";
import {
  DEFAULT_MODEL_ID,
  getCurrentManifest,
  refreshModelManifest,
  resolveModelCatalog,
  SMALL_MODEL_ID,
} from "@/lib/ai/providers";

/**
 * Lists the AI models available to the in-product model picker from the
 * T3Code-style ModelManifest. Returns only metadata & configured status
 * (no secrets).
 */
export async function GET() {
  await refreshModelManifest();
  const manifest = getCurrentManifest();
  const models = resolveModelCatalog();

  return NextResponse.json({
    defaultModelId: DEFAULT_MODEL_ID,
    smallModelId: SMALL_MODEL_ID,
    updatedAt: manifest.updatedAt,
    models: models.map(
      ({
        id,
        provider,
        label,
        local,
        tier,
        contextWindow,
        capabilities,
        badge,
        configured,
      }) => ({
        id,
        provider,
        label,
        local,
        tier,
        contextWindow,
        capabilities,
        ...(badge ? { badge } : {}),
        configured,
      }),
    ),
  });
}
