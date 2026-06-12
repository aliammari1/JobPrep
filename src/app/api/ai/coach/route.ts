import { type ModelMessage, streamText } from "ai";
import { NextResponse } from "next/server";
import { coachRequestSchema, COACH_SYSTEM_PROMPT } from "@/lib/ai/coach";
import {
  DEFAULT_MODEL_ID,
  isKnownModel,
  resolveModel,
} from "@/lib/ai/providers";

export const maxDuration = 60;

/**
 * Provider-agnostic AI Coach endpoint.
 *
 * Accepts a chat transcript plus an optional `model` id ("<provider>:<model>")
 * and streams the assistant reply. The provider (Claude / GPT / Gemini / Ollama)
 * is resolved at request time from the model id, so the same endpoint backs the
 * in-product model picker.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = coachRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const requestedModel = parsed.data.model;
  if (requestedModel && !isKnownModel(requestedModel)) {
    return NextResponse.json(
      { error: `Unknown model: ${requestedModel}` },
      { status: 400 },
    );
  }

  const modelId = requestedModel ?? DEFAULT_MODEL_ID;

  try {
    const result = streamText({
      model: resolveModel(modelId),
      system: COACH_SYSTEM_PROMPT,
      messages: parsed.data.messages as ModelMessage[],
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI Coach error:", error);
    return NextResponse.json(
      { error: "Failed to generate coach response" },
      { status: 500 },
    );
  }
}
