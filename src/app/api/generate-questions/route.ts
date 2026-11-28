import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateStructured, resolveRequestModel } from "@/lib/ai/generate";

export const runtime = "nodejs";

const streamedQuestionSchema = z.object({
  id: z.number().optional(),
  type: z.enum(["technical", "behavioral"]).optional(),
  question: z.string(),
  idealAnswer: z.string(),
  evaluationCriteria: z.array(z.string()),
});

// Retry helper function for API calls
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Check if it's a 503 overload error
      const is503Error =
        error?.message?.includes("503") ||
        error?.message?.includes("overloaded") ||
        error?.status === 503;

      // If it's the last attempt or not a retryable error, throw
      if (attempt === maxRetries - 1 || !is503Error) {
        throw error;
      }

      // Calculate exponential backoff delay
      const delay = initialDelay * 2 ** attempt;
      console.log(
        `Attempt ${attempt + 1} failed with 503. Retrying in ${delay}ms...`,
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
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
      behavioralQuestions = 8,
      model,
    } = await request.json();

    if (!jobDescription || !employeeSkills) {
      return NextResponse.json(
        { error: "Job description and employee skills are required" },
        { status: 400 },
      );
    }

    const modelId = resolveRequestModel(model, "fast");

    // Validate and calculate totals
    const numTechnical = Math.min(Math.max(technicalQuestions, 0), 40);
    const numBehavioral = Math.min(Math.max(behavioralQuestions, 0), 40);
    const totalQuestions = numTechnical + numBehavioral;

    if (totalQuestions < 5 || totalQuestions > 50) {
      return NextResponse.json(
        { error: "Total questions must be between 5 and 50" },
        { status: 400 },
      );
    }

    // Strategy: Generate questions ONE AT A TIME for true streaming
    // This way the first question arrives in ~2-3 seconds instead of waiting for all 20

    console.log("⏱️ Starting REAL streaming generation...");

    // Create a streaming response that generates questions on-the-fly
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial message immediately
          const initMessage = JSON.stringify({
            type: "init",
            totalQuestions: totalQuestions,
          });
          controller.enqueue(encoder.encode(initMessage + "\n"));
          console.log("📤 Sent init message");

          let generatedCount = 0;

          // Generate technical questions one by one
          for (let i = 0; i < numTechnical; i++) {
            const questionPrompt = `Generate 1 technical interview question based on:

JOB: ${jobDescription}

CANDIDATE SKILLS: ${employeeSkills}

Return ONLY valid JSON (no markdown):
{"id": ${generatedCount + 1}, "type": "technical", "question": "...", "idealAnswer": "brief 1-2 sentence answer", "evaluationCriteria": ["criterion 1", "criterion 2", "criterion 3"]}`;

            console.log(
              `🔄 Generating technical question ${i + 1}/${numTechnical}...`,
            );
            const startTime = Date.now();

            try {
              const questionData = await generateStructured({
                schema: streamedQuestionSchema,
                prompt: questionPrompt,
                modelId,
                tier: "fast",
                functionId: "generate-technical-question",
              });

              const genTime = Date.now() - startTime;
              console.log(`✅ Technical Q${i + 1} generated in ${genTime}ms`);

              // Ensure correct ID and type
              questionData.id = generatedCount + 1;
              questionData.type = "technical";

              // Send the question immediately
              const questionMessage = JSON.stringify({
                type: "question",
                index: generatedCount,
                question: questionData,
                received: generatedCount + 1,
                total: totalQuestions,
              });
              controller.enqueue(encoder.encode(questionMessage + "\n"));

              if (generatedCount === 0) {
                console.log("🎯 FIRST question sent - interview can start!");
              }

              generatedCount++;
            } catch (error) {
              console.error(
                `❌ Error generating technical question ${i + 1}:`,
                error,
              );
              console.error(
                `Raw text: ${error instanceof Error ? error.message : "Unknown"}`,
              );
            }
          }

          // Generate behavioral questions one by one
          for (let i = 0; i < numBehavioral; i++) {
            const questionPrompt = `Generate 1 behavioral interview question (STAR format) based on:

JOB: ${jobDescription}

CANDIDATE EXPERIENCE: ${employeeSkills}

Return ONLY valid JSON (no markdown):
{"id": ${generatedCount + 1}, "type": "behavioral", "question": "Tell me about a time when...", "idealAnswer": "brief 1-2 sentence STAR answer", "evaluationCriteria": ["criterion 1", "criterion 2", "criterion 3"]}`;

            console.log(
              `🔄 Generating behavioral question ${i + 1}/${numBehavioral}...`,
            );
            const startTime = Date.now();

            try {
              const questionData = await generateStructured({
                schema: streamedQuestionSchema,
                prompt: questionPrompt,
                modelId,
                tier: "fast",
                functionId: "generate-behavioral-question",
              });

              const genTime = Date.now() - startTime;
              console.log(`✅ Behavioral Q${i + 1} generated in ${genTime}ms`);

              // Ensure correct ID and type
              questionData.id = generatedCount + 1;
              questionData.type = "behavioral";

              // Send the question immediately
              const questionMessage = JSON.stringify({
                type: "question",
                index: generatedCount,
                question: questionData,
                received: generatedCount + 1,
                total: totalQuestions,
              });
              controller.enqueue(encoder.encode(questionMessage + "\n"));

              generatedCount++;
            } catch (error) {
              console.error(
                `Error generating behavioral question ${i + 1}:`,
                error,
              );
              // Continue with next question on error
            }
          }

          // Send completion message
          const completeMessage = JSON.stringify({
            type: "complete",
            totalQuestions: generatedCount,
          });
          controller.enqueue(encoder.encode(completeMessage + "\n"));
          console.log(
            `✅ Stream complete - ${generatedCount} questions generated`,
          );

          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error generating questions:", error);

    // Provide more helpful error messages
    let errorMessage = "Failed to generate interview questions";
    let statusCode = 500;

    if (error instanceof Error) {
      if (
        error.message.includes("503") ||
        error.message.includes("overloaded")
      ) {
        errorMessage =
          "The AI service is currently overloaded. Please try again in a few moments.";
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
        retryable: errorMessage.includes("overloaded"),
      },
      { status: statusCode },
    );
  }
}
