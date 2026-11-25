import { NextResponse } from "next/server";
import { z } from "zod";
import { generateStructured, resolveRequestModel } from "@/lib/ai/generate";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const maxDuration = 30;

const questionSchema = z.object({
  questions: z.array(
    z.object({
      text: z.string(),
      category: z.enum(["technical", "behavioral", "situational"]),
      difficulty: z.enum(["easy", "medium", "hard"]),
      expectedAnswer: z.string().optional(),
    }),
  ),
});

const requestSchema = z.object({
  role: z.string().min(1).max(200),
  skillLevel: z.string().min(1).max(100),
  count: z.number().int().min(1).max(20).optional(),
  focus: z.string().max(500).optional(),
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

    const { role, skillLevel, count = 5, focus } = parsed.data;
    let modelId: string;
    try {
      modelId = resolveRequestModel(parsed.data.model);
    } catch {
      return NextResponse.json(
        { error: `Unknown model: ${parsed.data.model}` },
        { status: 400 },
      );
    }

    try {
      const result = await generateStructured({
        modelId,
        functionId: "ai-generate-questions",
        schema: questionSchema,
        instructions: `You are an expert technical interviewer. Respond with structured output matching the requested schema.`,
        prompt: `Generate exactly ${count} interview questions for a ${skillLevel} ${role} position.
${focus ? `Focus on: ${focus}` : ""}

Categories: technical, behavioral, or situational
Difficulties: easy, medium, or hard. Include a brief expected answer per question.`,
      });
      return NextResponse.json(result);
    } catch (error) {
      console.error("Question generation error:", error);
      // Fallback so interview setup never hard-fails on a model outage.
      return NextResponse.json({
        questions: [
          {
            text: `Tell me about your experience with ${role} roles.`,
            category: "behavioral",
            difficulty: "medium",
            expectedAnswer:
              "Candidate should discuss relevant experience and achievements.",
          },
          {
            text: `What technical challenges have you faced and how did you solve them?`,
            category: "technical",
            difficulty: "medium",
            expectedAnswer:
              "Candidate should demonstrate problem-solving skills.",
          },
        ],
      });
    }
  } catch (error) {
    console.error("Question generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate questions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
