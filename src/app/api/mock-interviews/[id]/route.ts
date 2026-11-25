import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

function safeJsonParse<T = unknown>(
  value: string | null | undefined,
): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

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

    // Safely parse JSON fields and serialize dates
    const interviewData = {
      ...interview,
      startedAt: interview.startedAt?.toISOString() ?? null,
      completedAt: interview.completedAt?.toISOString() ?? null,
      createdAt: interview.createdAt.toISOString(),
      conversationLog: safeJsonParse(interview.conversationLog),
      feedback: safeJsonParse(interview.feedback),
      specificScores: safeJsonParse(interview.specificScores),
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
