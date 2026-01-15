import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const interview = await prisma.aIMockSession.findUnique({
      where: {
        id: id,
        userId: session.user.id, // Ensure user owns this interview
      },
    });

    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 },
      );
    }

    // Parse JSON fields
    const interviewData = {
      ...interview,
      conversationLog: interview.conversationLog
        ? JSON.parse(interview.conversationLog)
        : null,
      feedback: interview.feedback ? JSON.parse(interview.feedback) : null,
      specificScores: interview.specificScores
        ? JSON.parse(interview.specificScores)
        : null,
    };

    return NextResponse.json({
      success: true,
      interview: interviewData,
    });
  } catch (error) {
    console.error("Error fetching interview:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch interview",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
