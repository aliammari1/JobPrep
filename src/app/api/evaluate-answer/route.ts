import { NextRequest, NextResponse } from "next/server";
import { generateWithOllamaRetry, cleanJsonResponse } from "@/lib/ollama-client";

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { question, userAnswer, idealAnswer, evaluationCriteria } = await request.json();

    if (!question || !userAnswer || !idealAnswer) {
      return NextResponse.json(
        { error: "Question, user answer, and ideal answer are required" },
        { status: 400 }
      );
    }

    const prompt = `You are a STRICT interview evaluator. Compare the candidate's answer against the ideal answer and give HONEST scores.

QUESTION: ${question}

IDEAL ANSWER: ${idealAnswer}

CANDIDATE'S ANSWER: ${userAnswer}

EVALUATION CRITERIA: ${evaluationCriteria ? evaluationCriteria.join(', ') : 'Accuracy, completeness, clarity'}

STRICT SCORING RULES:
- Score 0-2: Wrong answer, irrelevant, or minimal effort (e.g., just "yes", "no", single words)
- Score 3-4: Partially correct but missing major points or lacks detail
- Score 5-6: Covers basic concepts but incomplete or has some errors
- Score 7-8: Good answer covering most key points from ideal answer
- Score 9-10: Excellent answer matching or exceeding ideal answer

CRITICAL INSTRUCTIONS:
1. If candidate gives SHORT answers (1-5 words) when ideal answer is LONG (paragraph), score 0-2
2. If candidate's answer is COMPLETELY DIFFERENT from ideal answer, score 0-1
3. If candidate just says "yes", "no", "maybe", "I don't know" → score 0
4. Compare candidate's technical accuracy against ideal answer - wrong facts = low score
5. Check if candidate covers the KEY CONCEPTS mentioned in ideal answer
6. Be HARSH on vague or generic answers that don't match the ideal answer

Return ONLY this JSON (NO markdown, NO code blocks):
{
  "score": <0-10>,
  "strengths": ["strength1 if any", "strength2 if any"],
  "weaknesses": ["specific weakness1", "specific weakness2"],
  "suggestions": ["how to improve1", "how to improve2"],
  "feedback": "Honest direct feedback comparing to ideal answer",
  "keyPointsCovered": ["concepts they got right"],
  "keyPointsMissed": ["concepts from ideal answer they missed"]
}

Be STRICT and HONEST. If the answer is bad, give score 0-3. Don't be generous!`;

    console.log("Evaluating answer with Ollama (local & fast)...");
    const text = await generateWithOllamaRetry(prompt);
    const cleanedText = cleanJsonResponse(text);

    console.log("Raw response length:", text.length);
    console.log("Cleaned JSON preview:", cleanedText.substring(0, 200));

    let evaluation;
    try {
      evaluation = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Full cleaned text:", cleanedText);
      
      // Return a default evaluation on parse error
      evaluation = {
        score: 5,
        strengths: ["Answer provided"],
        weaknesses: ["Unable to evaluate properly due to parsing error"],
        suggestions: ["Please try answering again"],
        feedback: "Technical error occurred during evaluation",
        keyPointsCovered: [],
        keyPointsMissed: []
      };
    }

    return NextResponse.json(evaluation);

  } catch (error: any) {
    console.error("Error evaluating answer:", error);
    
    // Check if it's a service overload or rate limit
    const isOverloadError = error?.status === 503 || error?.message?.includes('overloaded');
    const isRateLimitError = error?.status === 429 || error?.message?.includes('quota');
    
    if (isOverloadError || isRateLimitError) {
      // Return a fallback evaluation instead of error
      return NextResponse.json({
        score: 5,
        strengths: ["Answer submitted"],
        weaknesses: ["Evaluation service temporarily unavailable"],
        suggestions: ["Your answer has been recorded"],
        feedback: isOverloadError 
          ? "AI evaluation service is currently overloaded. Your answer is saved and will be reviewed."
          : "Rate limit reached. Your answer is saved.",
        keyPointsCovered: [],
        keyPointsMissed: []
      });
    }
    
    return NextResponse.json(
      { 
        error: "Failed to evaluate answer",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
