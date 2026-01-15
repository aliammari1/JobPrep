import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

// GET: Retrieve a specific interview
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
        userId: session.user.id, // Ensure user can only access their own interviews
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

    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      interview,
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

// DELETE: Delete a specific interview
export async function DELETE(
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

    // First check if the interview exists and belongs to the user
    const interview = await prisma.aIMockSession.findUnique({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found or unauthorized" },
        { status: 404 },
      );
    }

    // Delete the interview
    await prisma.aIMockSession.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Interview deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting interview:", error);
    return NextResponse.json(
      {
        error: "Failed to delete interview",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
