import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText } from "ai";
import { NextResponse } from "next/server";

export const maxDuration = 60;

// Configure Ollama as OpenAI-compatible provider
const ollama = createOpenAICompatible({
  name: "ollama",
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama", // Ollama doesn't require an API key, but the field is required
});

export async function POST(req: Request) {
  try {
    const { question, answer, context } = await req.json();

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Missing required fields: question and answer" },
        { status: 400 },
      );
    }

    const result = streamText({
      model: ollama("llama3.2"),
      system: `You are an expert interview coach. Analyze candidate responses and provide constructive, actionable feedback. Be encouraging but honest.`,
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
