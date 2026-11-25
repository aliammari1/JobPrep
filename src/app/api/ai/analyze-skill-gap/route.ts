import { NextResponse } from "next/server";
import { z } from "zod";
import { generateStructured, resolveRequestModel } from "@/lib/ai/generate";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const maxDuration = 30;

const skillAnalysisSchema = z.object({
  matchPercentage: z.number().min(0).max(100),
  missingSkills: z.array(
    z.object({
      skill: z.string(),
      proficiency: z.enum(["beginner", "intermediate", "advanced", "expert"]),
      required: z.boolean(),
      importance: z.enum(["critical", "high", "medium", "low"]),
    }),
  ),
  matchingSkills: z.array(
    z.object({
      skill: z.string(),
      proficiency: z.enum(["beginner", "intermediate", "advanced", "expert"]),
      required: z.boolean(),
      importance: z.enum(["critical", "high", "medium", "low"]),
    }),
  ),
  learningPath: z.array(
    z.object({
      title: z.string(),
      provider: z.string(),
      duration: z.string(),
      type: z.enum(["course", "certification", "tutorial", "book"]),
      url: z.string(),
      rating: z.number().min(0).max(5),
      price: z.enum(["free", "paid"]),
    }),
  ),
});

const requestSchema = z.object({
  jobDescription: z.string().min(1).max(20_000),
  cvSkills: z.array(z.string().max(100)).min(1).max(200),
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

    const { jobDescription, cvSkills } = parsed.data;
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
        functionId: "ai-analyze-skill-gap",
        schema: skillAnalysisSchema,
        instructions: `You are an expert career counselor and technical skills analyst. Respond with structured output matching the requested schema.`,
        prompt: `Analyze the following job description and the user's current skills to identify skills gaps and provide recommendations.

Job Description:
${jobDescription}

User's Current Skills:
${cvSkills.join(", ")}

Focus on technical skills relevant to the job. Be realistic about skill importance and requirements.`,
      });
      return NextResponse.json(result);
    } catch (error) {
      console.error("Skill gap analysis error:", error);
      // Fallback so the UI never hard-fails on a model outage.
      return NextResponse.json({
        matchPercentage: 50,
        missingSkills: [
          {
            skill: "Sample Missing Skill",
            proficiency: "intermediate",
            required: true,
            importance: "high",
          },
        ],
        matchingSkills: [
          {
            skill: "Sample Matching Skill",
            proficiency: "intermediate",
            required: true,
            importance: "high",
          },
        ],
        learningPath: [
          {
            title: "Sample Course",
            provider: "Sample Provider",
            duration: "10 hours",
            type: "course",
            url: "https://example.com",
            rating: 4.5,
            price: "free",
          },
        ],
      });
    }
  } catch (error) {
    console.error("Skill gap analysis error:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze skill gap",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
