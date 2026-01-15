import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/interviews/[id] - Get a specific interview
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phoneNumber: true,
          },
        },
        interviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
        template: {
          include: {
            questions: {
              orderBy: {
                order: "asc",
              },
            },
          },
        },
        responses: {
          include: {
            question: true,
          },
        },
        evaluations: {
          include: {
            evaluator: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        analytics: true,
      },
    });

    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(interview);
  } catch (error) {
    console.error("Error fetching interview:", error);
    return NextResponse.json(
      { error: "Failed to fetch interview" },
      { status: 500 },
    );
  }
}

// PATCH /api/interviews/[id] - Update an interview
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const {
      status,
      scheduledAt,
      startedAt,
      completedAt,
      interviewerId,
      videoRecordingUrl,
      audioRecordingUrl,
      aiAnalysisReport,
      overallScore,
      technicalScore,
      behavioralScore,
      communicationScore,
      settings,
    } = body;

    const updateData: any = {};

    if (status) updateData.status = status;
    if (scheduledAt) updateData.scheduledAt = new Date(scheduledAt);
    if (startedAt) updateData.startedAt = new Date(startedAt);
    if (completedAt) updateData.completedAt = new Date(completedAt);
    if (interviewerId !== undefined) updateData.interviewerId = interviewerId;
    if (videoRecordingUrl !== undefined)
      updateData.videoRecordingUrl = videoRecordingUrl;
    if (audioRecordingUrl !== undefined)
      updateData.audioRecordingUrl = audioRecordingUrl;
    if (aiAnalysisReport !== undefined)
      updateData.aiAnalysisReport = aiAnalysisReport;
    if (overallScore !== undefined) updateData.overallScore = overallScore;
    if (technicalScore !== undefined)
      updateData.technicalScore = technicalScore;
    if (behavioralScore !== undefined)
      updateData.behavioralScore = behavioralScore;
    if (communicationScore !== undefined)
      updateData.communicationScore = communicationScore;
    if (settings !== undefined) updateData.settings = JSON.stringify(settings);

    const interview = await prisma.interview.update({
      where: { id },
      data: updateData,
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        interviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
        template: {
          select: {
            id: true,
            title: true,
            category: true,
            difficulty: true,
            duration: true,
          },
        },
      },
    });

    return NextResponse.json(interview);
  } catch (error) {
    console.error("Error updating interview:", error);
    return NextResponse.json(
      { error: "Failed to update interview" },
      { status: 500 },
    );
  }
}

// DELETE /api/interviews/[id] - Delete an interview
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.interview.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Interview deleted successfully" });
  } catch (error) {
    console.error("Error deleting interview:", error);
    return NextResponse.json(
      { error: "Failed to delete interview" },
      { status: 500 },
    );
  }
}
