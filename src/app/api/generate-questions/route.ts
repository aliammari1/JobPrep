import { NextRequest, NextResponse } from "next/server";
import { generateWithOllamaRetry, cleanJsonResponse } from "@/lib/ollama-client";

export const runtime = 'nodejs';

// Retry helper function for API calls
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a 503 overload error
      const is503Error = error?.message?.includes("503") || 
                         error?.message?.includes("overloaded") ||
                         error?.status === 503;
      
      // If it's the last attempt or not a retryable error, throw
      if (attempt === maxRetries - 1 || !is503Error) {
        throw error;
      }
      
      // Calculate exponential backoff delay
      const delay = initialDelay * Math.pow(2, attempt);
      console.log(`Attempt ${attempt + 1} failed with 503. Retrying in ${delay}ms...`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error("Max retries reached");
}

export async function POST(request: NextRequest) {
  try {
    const { 
      jobDescription, 
      employeeSkills, 
      technicalQuestions = 12, 
      behavioralQuestions = 8 
    } = await request.json();

    if (!jobDescription || !employeeSkills) {
      return NextResponse.json(
        { error: "Job description and employee skills are required" },
        { status: 400 }
      );
    }

    // Validate and calculate totals
    const numTechnical = Math.min(Math.max(technicalQuestions, 0), 40);
    const numBehavioral = Math.min(Math.max(behavioralQuestions, 0), 40);
    const totalQuestions = numTechnical + numBehavioral;

    if (totalQuestions < 5 || totalQuestions > 50) {
      return NextResponse.json(
        { error: "Total questions must be between 5 and 50" },
        { status: 400 }
      );
    }

    const prompt = `Generate exactly ${totalQuestions} interview questions based on this job and candidate profile.

JOB: ${jobDescription}

CANDIDATE: ${employeeSkills}

Requirements:
- ${numTechnical} technical questions
- ${numBehavioral} behavioral questions (STAR format)
- Each with brief ideal answer (1-2 sentences only!)
- Each with 3 short evaluation criteria

Return ONLY valid JSON (no markdown, no extra text):
{
  "questions": [
    {
      "id": 1,
      "type": "technical",
      "question": "...",
      "idealAnswer": "Brief 1-2 sentence answer",
      "evaluationCriteria": ["criterion1", "criterion2", "criterion3"]
    }
  ]
}

Keep ALL answers very concise. Focus on job-relevant questions.`;

    console.log("Generating questions with Ollama (local & fast)...");
    
    // Use Ollama instead of Gemini - much faster!
    const text = await generateWithOllamaRetry(prompt);

    console.log("Raw Ollama response length:", text.length);
    console.log("First 300 chars:", text.substring(0, 300));

    // Clean JSON response
    const cleanedText = cleanJsonResponse(text);

    let questionsData;
    try {
      questionsData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Attempted to parse:", cleanedText.substring(0, 500));
      throw new Error(`Failed to parse Ollama response as JSON: ${parseError instanceof Error ? parseError.message : "Unknown error"}`);
    }

    // Validate the response structure
    if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
      throw new Error("Invalid response structure from Ollama");
    }

    // Ensure we have the requested number of questions
    if (questionsData.questions.length !== totalQuestions) {
      console.warn(`Expected ${totalQuestions} questions, got ${questionsData.questions.length}`);
    }

    console.log(`Successfully generated ${questionsData.questions.length} questions`);

    return NextResponse.json({
      success: true,
      questions: questionsData.questions,
      totalQuestions: questionsData.questions.length,
    });

  } catch (error) {
    console.error("Error generating questions:", error);
    
    // Provide more helpful error messages
    let errorMessage = "Failed to generate interview questions";
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes("503") || error.message.includes("overloaded")) {
        errorMessage = "The AI service is currently overloaded. Please try again in a few moments.";
        statusCode = 503;
      } else if (error.message.includes("API key")) {
        errorMessage = "API configuration error. Please contact support.";
        statusCode = 500;
      } else if (error.message.includes("parse")) {
        errorMessage = "Failed to process AI response. Please try again.";
        statusCode = 500;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : "Unknown error",
        retryable: errorMessage.includes("overloaded")
      },
      { status: statusCode }
    );
  }
}
