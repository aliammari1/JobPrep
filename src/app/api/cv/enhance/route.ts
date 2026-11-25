import { NextResponse } from "next/server";
import { z } from "zod";
import { generateStructured, resolveRequestModel } from "@/lib/ai/generate";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const maxDuration = 60;

const cvDataSchema = z.object({
  personalInfo: z
    .object({ fullName: z.string().max(200).optional() })
    .passthrough()
    .optional(),
  summary: z.string().max(10_000).optional(),
  experiences: z
    .array(
      z
        .object({ id: z.string(), description: z.string().optional() })
        .passthrough(),
    )
    .optional(),
  skills: z.array(z.string().max(100)).optional(),
  model: z.string().optional(),
});

const enhancementSchema = z.object({
  summary: z.string(),
  experiences: z.array(z.object({ id: z.string(), description: z.string() })),
});

export async function POST(request: Request) {
  try {
    const limit = await rateLimit(request, "ai");
    if (!limit.success) return rateLimitResponse(limit);

    const body: unknown = await request.json();
    const parsed = cvDataSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const cvData = parsed.data as Record<string, any>;

    let modelId: string;
    try {
      modelId = resolveRequestModel(parsed.data.model);
    } catch {
      return NextResponse.json(
        { error: `Unknown model: ${parsed.data.model}` },
        { status: 400 },
      );
    }

    const fullName = parsed.data.personalInfo?.fullName ?? "the candidate";
    const summary = parsed.data.summary ?? "";
    const experiences = parsed.data.experiences ?? [];
    const skills = parsed.data.skills ?? [];

    let enhancedData: z.infer<typeof enhancementSchema>;
    try {
      enhancedData = await generateStructured({
        modelId,
        functionId: "cv-enhance",
        schema: enhancementSchema,
        instructions:
          "You are an expert resume writer. Enhance CV content to be professional and impactful. Respond with structured output matching the requested schema.",
        prompt: `Enhance this CV content to be more professional and impactful.

CV Data:
- Name: ${fullName}
- Summary: ${summary}
- Experience: ${JSON.stringify(experiences)}
- Skills: ${skills.join(", ")}

Provide improved versions of:
1. Professional summary
2. Experience descriptions (make them achievement-focused with quantifiable results)`,
      });
    } catch {
      // If the model is unavailable, return the original data so the user
      // never loses their work.
      return NextResponse.json(cvData);
    }

    // Merge enhanced data
    const enhanced = {
      ...cvData,
      summary: enhancedData.summary || cvData.summary,
      experiences: (cvData.experiences ?? []).map((exp: any) => {
        const enhancedExp = enhancedData.experiences?.find(
          (e: any) => e.id === exp.id,
        );
        return enhancedExp
          ? { ...exp, description: enhancedExp.description }
          : exp;
      }),
    };

    return NextResponse.json(enhanced);
  } catch (error) {
    console.error("Enhancement error:", error);
    return NextResponse.json(
      { error: "Failed to enhance CV" },
      { status: 500 },
    );
  }
}
