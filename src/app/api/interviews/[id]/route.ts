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

    if (
      interview.candidateId !== session.user.id &&
      interview.interviewerId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      ...interview,
      scheduledAt: interview.scheduledAt?.toISOString() ?? null,
      startedAt: interview.startedAt?.toISOString() ?? null,
      completedAt: interview.completedAt?.toISOString() ?? null,
      createdAt: interview.createdAt.toISOString(),
      updatedAt: interview.updatedAt.toISOString(),
    });
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

    const existing = await prisma.interview.findUnique({
      where: { id },
      select: { id: true, candidateId: true, interviewerId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 },
      );
    }

    if (
      existing.candidateId !== session.user.id &&
      existing.interviewerId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
      candidateName,
      position,
      candidateEmail,
      candidatePhone,
      notes,
      type,
      duration,
      time,
    } = body;

    const settingsObj =
      settings && typeof settings === "object"
        ? (settings as Record<string, any>)
        : {};

    const updateData: Record<string, any> = {};

    if (status) updateData.status = status;
    if (scheduledAt) {
      const parsed = new Date(scheduledAt);
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json(
          { error: "Invalid scheduledAt date" },
          { status: 400 },
        );
      }
      updateData.scheduledAt = parsed;
    }
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

    if (candidateName !== undefined || settingsObj.candidateName !== undefined)
      updateData.candidateName = candidateName ?? settingsObj.candidateName;
    if (position !== undefined || settingsObj.position !== undefined)
      updateData.position = position ?? settingsObj.position;
    if (candidateEmail !== undefined || settingsObj.candidateEmail !== undefined)
      updateData.candidateEmail = candidateEmail ?? settingsObj.candidateEmail;
    if (candidatePhone !== undefined || settingsObj.candidatePhone !== undefined)
      updateData.candidatePhone = candidatePhone ?? settingsObj.candidatePhone;
    if (notes !== undefined || settingsObj.notes !== undefined)
      updateData.notes = notes ?? settingsObj.notes;
    if (type !== undefined || settingsObj.type !== undefined)
      updateData.type = type ?? settingsObj.type;
    if (duration !== undefined || settingsObj.duration !== undefined)
      updateData.duration = duration ?? settingsObj.duration;
    if (time !== undefined || settingsObj.time !== undefined)
      updateData.time = time ?? settingsObj.time;

    if (settings !== undefined) {
      updateData.settings =
        typeof settings === "string" ? settings : JSON.stringify(settings);
    }

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

    return NextResponse.json({
      ...interview,
      scheduledAt: interview.scheduledAt?.toISOString() ?? null,
      startedAt: interview.startedAt?.toISOString() ?? null,
      completedAt: interview.completedAt?.toISOString() ?? null,
      createdAt: interview.createdAt.toISOString(),
      updatedAt: interview.updatedAt.toISOString(),
    });
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

    const existing = await prisma.interview.findUnique({
      where: { id },
      select: { id: true, candidateId: true, interviewerId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 },
      );
    }

    if (
      existing.candidateId !== session.user.id &&
      existing.interviewerId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
