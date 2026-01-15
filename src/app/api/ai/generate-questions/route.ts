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

export async function POST(req: Request) {
  try {
    const { role, skillLevel, count = 5, focus } = await req.json();

    const { text } = await generateText({
      model: ollama("llama3.2"),
      system: `You are an expert technical interviewer. You MUST respond with valid JSON only. No explanations, no markdown, just pure JSON.`,
      prompt: `Generate exactly ${count} interview questions for a ${skillLevel} ${role} position.
${focus ? `Focus on: ${focus}` : ""}

CRITICAL: Return ONLY valid JSON. No markdown. No code blocks. No explanations.
Use this EXACT structure:
{
  "questions": [
    {
      "text": "Question text here",
      "category": "technical",
      "difficulty": "medium",
      "expectedAnswer": "Brief expected answer"
    }
  ]
}

Categories: technical, behavioral, or situational
Difficulties: easy, medium, or hard`,
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

    let parsed: z.infer<typeof questionSchema>;
    try {
      const jsonData = JSON.parse(cleanedText);
      parsed = questionSchema.parse(jsonData);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Cleaned text:", cleanedText);
      console.error("Original text:", text);

      // Return a fallback response with default questions
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

    return NextResponse.json(parsed);
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
