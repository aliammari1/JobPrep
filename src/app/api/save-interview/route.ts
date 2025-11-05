import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
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
      specificScores 
    } = await request.json();

    console.log("Saving interview with data:", {
      userId: session.user.id,
      sessionType,
      topicsType: typeof topics,
      topicsIsArray: Array.isArray(topics),
      topics,
      duration,
      conversationLogLength: conversationLog?.length,
      hasFeedback: !!feedback,
      hasSpecificScores: !!specificScores
    });

    // Ensure topics is an array
    const topicsArray = Array.isArray(topics) ? topics : (topics ? [topics] : []);

    // Save to database
    const mockSession = await prisma.aIMockSession.create({
      data: {
        userId: session.user.id,
        sessionType: sessionType || "mock-interview",
        aiPersonality: "professional",
        difficultyLevel: "intermediate",
        topics: topicsArray,
        duration: duration || 0,
        conversationLog: JSON.stringify(conversationLog),
        feedback: JSON.stringify(feedback),
        improvementAreas: improvementAreas || [],
        overallScore: overallScore,
        specificScores: JSON.stringify(specificScores),
        startedAt: new Date(Date.now() - (duration || 0) * 60000), // Calculate start time
        completedAt: new Date(),
      },
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
      select: {
        id: true,
        sessionType: true,
        topics: true,
        duration: true,
        overallScore: true,
        conversationLog: true,
        feedback: true,
        specificScores: true,
        startedAt: true,
        completedAt: true,
        createdAt: true,
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
