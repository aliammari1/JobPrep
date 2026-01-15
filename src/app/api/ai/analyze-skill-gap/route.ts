import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";

export const maxDuration = 30;

// Configure Ollama as OpenAI-compatible provider
const ollama = createOpenAICompatible({
  name: "ollama",
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama",
});

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

export async function POST(req: Request) {
  try {
    const { jobDescription, cvSkills } = await req.json();

    if (!jobDescription || !cvSkills || !Array.isArray(cvSkills)) {
      return NextResponse.json(
        { error: "Invalid input: jobDescription and cvSkills array required" },
        { status: 400 },
      );
    }

    const { text } = await generateText({
      model: ollama("llama3.2"), // Using Mistral model
      system: `You are an expert career counselor and technical skills analyst. You MUST respond with valid JSON only. No explanations, no markdown, just pure JSON.`,
      prompt: `
Analyze the following job description and the user's current skills to identify skills gaps and provide recommendations.

Job Description:
${jobDescription}

User's Current Skills:
${cvSkills.join(", ")}

Please provide a JSON response with the following structure:
{
  "matchPercentage": number (0-100),
  "missingSkills": [
    {
      "skill": "string",
      "proficiency": "beginner" | "intermediate" | "advanced" | "expert",
      "required": boolean,
      "importance": "critical" | "high" | "medium" | "low"
    }
  ],
  "matchingSkills": [
    {
      "skill": "string",
      "proficiency": "beginner" | "intermediate" | "advanced" | "expert",
      "required": boolean,
      "importance": "critical" | "high" | "medium" | "low"
    }
  ],
  "learningPath": [
    {
      "title": "string",
      "provider": "string",
      "duration": "string (e.g., '20 hours')",
      "type": "course" | "certification" | "tutorial" | "book",
      "url": "string",
      "rating": number (0-5),
      "price": "free" | "paid"
    }
  ]
}

Focus on technical skills relevant to the job. Be realistic about skill importance and requirements.
CRITICAL: Return ONLY valid JSON. No markdown. No code blocks. No explanations.
`,
    });

    console.log("Raw generated text:", text);

    // Aggressive JSON cleaning
    let cleanedText = text.trim();

    // Remove markdown code blocks
    cleanedText = cleanedText
      .replace(/```json\n?/gi, "")
      .replace(/```\n?/g, "");

    // Remove any leading/trailing non-JSON text
    const jsonStart = cleanedText.indexOf("{");
    const jsonEnd = cleanedText.lastIndexOf("}");

    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
    }

    // Fix common JSON issues
    cleanedText = cleanedText
      .replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
      .replace(/\n/g, " ") // Remove newlines that might break strings
      .replace(/\r/g, ""); // Remove carriage returns

    let parsed: z.infer<typeof skillAnalysisSchema>;
    try {
      const jsonData = JSON.parse(cleanedText);
      parsed = skillAnalysisSchema.parse(jsonData);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Cleaned text:", cleanedText);
      console.error("Original text:", text);

      // Return a fallback response
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

    return NextResponse.json(parsed);
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
