import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    console.log("=== SAVE-INTERVIEW API CALLED ===");
    
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    console.log("Session check:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id
    });

    if (!session?.user) {
      console.error("No authenticated user found");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { 
      sessionType,
      topics,
      duration,
      conversationLog,
      feedback,
      improvementAreas,
      overallScore,
      specificScores,
      questions, // NEW: Complete question data with answers and evaluations
      candidateName,
      jobTitle,
      companyName
    } = await request.json();

    console.log("Request body received:", {
      sessionType,
      topicsArray: Array.isArray(topics),
      duration,
      hasConversationLog: !!conversationLog,
      hasFeedback: !!feedback,
      hasSpecificScores: !!specificScores,
      questionsCount: Array.isArray(questions) ? questions.length : 0,
      candidateName,
      jobTitle,
      companyName
    });

    // Ensure topics is an array
    const topicsArray = Array.isArray(topics) ? topics : (topics ? [topics] : []);

    // Build detailed questions array with all information
    const detailedQuestions = Array.isArray(questions) ? questions.map((q: any, index: number) => ({
      order: index + 1,
      questionText: q.question?.question || "",
      questionType: q.question?.type || "",
      idealAnswer: q.question?.idealAnswer || "",
      userAnswer: q.userAnswer || "",
      timeSpent: q.timeSpent || 0,
      evaluation: {
        score: q.evaluation?.score || 0,
        feedback: q.evaluation?.feedback || "",
        strengths: q.evaluation?.strengths || [],
        weaknesses: q.evaluation?.weaknesses || [],
        suggestions: q.evaluation?.suggestions || []
      }
    })) : [];

    console.log("Detailed questions prepared:", {
      count: detailedQuestions.length,
      sampleQuestion: detailedQuestions[0] ? {
        text: detailedQuestions[0].questionText?.substring(0, 50),
        hasUserAnswer: !!detailedQuestions[0].userAnswer,
        hasIdealAnswer: !!detailedQuestions[0].idealAnswer,
        userAnswerLength: detailedQuestions[0].userAnswer?.length || 0,
        idealAnswerLength: detailedQuestions[0].idealAnswer?.length || 0
      } : null
    });

    // Save session first
    const mockSession = await prisma.aIMockSession.create({
      data: {
        userId: session.user.id,
        sessionType: sessionType || "mock-interview",
        aiPersonality: "professional",
        difficultyLevel: "intermediate",
        topics: topicsArray,
        duration: duration || 0,
        conversationLog: JSON.stringify({
          candidateName,
          jobTitle,
          companyName,
          questions: detailedQuestions // Store detailed question data with answers and evaluations
        }),
        feedback: JSON.stringify(feedback),
        improvementAreas: improvementAreas || [],
        overallScore: overallScore,
        specificScores: JSON.stringify(specificScores),
        startedAt: new Date(Date.now() - (duration || 0) * 60000), // Calculate start time
        completedAt: new Date(),
      },
    });

    console.log("Session created:", { sessionId: mockSession.id });

    // Save individual questions
    try {
      console.log("Starting to save questions...", {
        count: detailedQuestions.length,
        sessionId: mockSession.id
      });

      for (const q of detailedQuestions) {
        console.log("Saving question:", {
          order: q.order,
          questionText: q.questionText?.substring(0, 50),
          hasUserAnswer: !!q.userAnswer,
          hasIdealAnswer: !!q.idealAnswer
        });

        await prisma.mockQuestion.create({
          data: {
            id: `${mockSession.id}-q${q.order}`,
            sessionId: mockSession.id,
            questionText: q.questionText,
            questionType: q.questionType,
            idealAnswer: q.idealAnswer,
            userAnswer: q.userAnswer,
            timeSpent: q.timeSpent,
            score: q.evaluation?.score,
            feedback: q.evaluation?.feedback,
            strengths: q.evaluation?.strengths || [],
            weaknesses: q.evaluation?.weaknesses || [],
            suggestions: q.evaluation?.suggestions || [],
            order: q.order,
          },
        });
      }
      console.log("Questions saved successfully:", { count: detailedQuestions.length });
    } catch (qError) {
      console.error("ERROR saving questions:", qError);
      console.error("Question error details:", {
        name: qError instanceof Error ? qError.name : 'Unknown',
        message: qError instanceof Error ? qError.message : 'Unknown error',
        stack: qError instanceof Error ? qError.stack : 'No stack trace'
      });
    }

    console.log("Interview saved successfully:", {
      sessionId: mockSession.id,
      userId: mockSession.userId
    });

    return NextResponse.json({
      success: true,
      sessionId: mockSession.id,
      message: "Interview saved successfully",
    });

  } catch (error) {
    console.error("Error saving interview:", error);
    console.error("Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return NextResponse.json(
      { 
        error: "Failed to save interview",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// GET: Retrieve user's saved interviews
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const interviews = await prisma.aIMockSession.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        mockQuestions: {
          orderBy: {
            order: 'asc',
          }
        }
      },
    });

    return NextResponse.json({
      success: true,
      interviews,
    });

  } catch (error) {
    console.error("Error fetching interviews:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch interviews",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
