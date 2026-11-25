import { NextResponse } from "next/server";
import { z } from "zod";
import { generateModelText, resolveRequestModel } from "@/lib/ai/generate";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const maxDuration = 60;

const requestSchema = z.object({
  companyName: z.string().min(1).max(200),
  position: z.string().min(1).max(200),
  content: z.string().min(1).max(20_000),
  model: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const limit = await rateLimit(request, "ai");
    if (!limit.success) return rateLimitResponse(limit);

    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { companyName, position, content } = parsed.data;
    let modelId: string;
    try {
      modelId = resolveRequestModel(parsed.data.model);
    } catch {
      return NextResponse.json(
        { error: `Unknown model: ${parsed.data.model}` },
        { status: 400 },
      );
    }

    const plainContent = content.replace(/<[^>]*>/g, "");

    const enhancedContent = await generateModelText({
      modelId,
      functionId: "cover-letter-enhance",
      instructions:
        "You are an expert cover-letter writer. Improve the letter while keeping it concise (under 400 words). Return only the enhanced letter content as plain text, no JSON.",
      prompt: `Enhance this cover letter to be more compelling and professional.

Company: ${companyName}
Position: ${position}
Current Content: ${plainContent}

Improve the content by:
1. Making it more specific to the role
2. Highlighting relevant achievements
3. Using stronger action verbs
4. Maintaining professional tone
5. Keeping it concise (under 400 words)`,
    });

    return NextResponse.json({ content: enhancedContent });
  } catch (error) {
    console.error("Enhancement error:", error);
    return NextResponse.json(
      { error: "Failed to enhance cover letter" },
      { status: 500 },
    );
  }
}
