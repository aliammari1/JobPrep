import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveRequestModel, streamModelText } from "@/lib/ai/generate";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const maxDuration = 60;

const requestSchema = z.object({
  question: z.string().min(1).max(10_000),
  answer: z.string().min(1).max(20_000),
  context: z.string().max(10_000).optional(),
  model: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const limit = await rateLimit(req, "ai");
    if (!limit.success) return rateLimitResponse(limit);

    const parsed = requestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { question, answer, context } = parsed.data;
    let modelId: string;
    try {
      modelId = resolveRequestModel(parsed.data.model);
    } catch {
      return NextResponse.json(
        { error: `Unknown model: ${parsed.data.model}` },
        { status: 400 },
      );
    }

    const result = streamModelText({
      modelId,
      functionId: "ai-analyze-response",
      instructions: `You are an expert interview coach. Analyze candidate responses and provide constructive, actionable feedback. Be encouraging but honest.`,
      prompt: `Interview Question: ${question}

Candidate's Answer: ${answer}

${context ? `Additional Context: ${context}` : ""}

Provide detailed feedback covering:
1. **Strengths**: What the candidate did well
2. **Areas for Improvement**: Specific points to enhance
3. **Communication Clarity**: Score (1-10) with brief explanation
4. **Technical Accuracy**: If applicable, evaluate correctness
5. **Better Answer Approach**: Suggestions for improvement

Format your response clearly with headers and bullet points.`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Response analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze response" },
      { status: 500 },
    );
  }
}
