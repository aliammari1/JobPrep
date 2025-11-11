import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createGoogleCalendarEvent } from "@/lib/google-calendar";

// GET /api/interviews - Get all interviews with filters
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const candidateId = searchParams.get("candidateId");
    const interviewerId = searchParams.get("interviewerId");
    const templateId = searchParams.get("templateId");

    const where: Record<string, string> = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (candidateId) {
      where.candidateId = candidateId;
    }

    if (interviewerId) {
      where.interviewerId = interviewerId;
    }

    if (templateId) {
      where.templateId = templateId;
    }

    const interviews = await prisma.interview.findMany({
      where,
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
        evaluations: {
          include: {
            evaluator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        scheduledAt: "desc",
      },
    });

    return NextResponse.json({ interviews });
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch interviews" },
      { status: 500 }
    );
  }
}

// POST /api/interviews - Create a new interview
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      candidateId,
      interviewerId,
      templateId,
      scheduledAt,
      isAIInterviewer,
      allowRecording,
      settings,
    } = body;

    // Validate required fields
    if (!candidateId) {
      return NextResponse.json(
        { error: "candidateId is required" },
        { status: 400 }
      );
    }

    // Get or create a default template if templateId not provided
    let finalTemplateId = templateId;
    if (!finalTemplateId) {
      // Try to find a default template or create one
      let defaultTemplate = await prisma.interviewTemplate.findFirst({
        where: {
          title: "General Interview",
          createdBy: session.user.id,
        },
      });

      if (!defaultTemplate) {
        // Create a default template
        defaultTemplate = await prisma.interviewTemplate.create({
          data: {
            title: "General Interview",
            description: "Default interview template",
            category: "General",
            difficulty: "Medium",
            duration: 60,
            isPublic: false,
            createdBy: session.user.id,
            tags: [],
          },
        });
      }

      finalTemplateId = defaultTemplate.id;
    }

    // Create the interview
    const interview = await prisma.interview.create({
      data: {
        candidateId,
        interviewerId,
        templateId: finalTemplateId,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        isAIInterviewer: isAIInterviewer || false,
        allowRecording: allowRecording !== undefined ? allowRecording : true,
        settings: settings ? JSON.stringify(settings) : null,
        status: "scheduled",
      },
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

    // Try to sync with Google Calendar if connected
    try {
      if (scheduledAt) {
        const settingsData = settings ? JSON.parse(settings) : {};
        const result = await createGoogleCalendarEvent(
          session.user.id,
          {
            summary: `Interview: ${settingsData.position || "Position"} - ${settingsData.candidateName || "Candidate"}`,
            description: `Interview Details:\n\nPosition: ${settingsData.position || "N/A"}\nCandidate: ${settingsData.candidateName || "N/A"}\nEmail: ${settingsData.candidateEmail || "N/A"}\nPhone: ${settingsData.candidatePhone || "N/A"}\nType: ${settingsData.type || "video"}\n\nNotes:\n${settingsData.notes || "No additional notes"}`,
            startTime: new Date(scheduledAt),
            endTime: new Date(new Date(scheduledAt).getTime() + (settingsData.duration || 60) * 60000),
            attendees: settingsData.candidateEmail ? [settingsData.candidateEmail] : [],
          }
        );

        if (result.success && result.eventId) {
          // Update interview with calendar event ID
          await prisma.interview.update({
            where: { id: interview.id },
            data: {
              settings: JSON.stringify({
                ...settingsData,
                googleCalendarEventId: result.eventId,
              }),
            },
          });
        }
      }
    } catch (calendarError) {
      // Log but don't fail the interview creation if calendar sync fails
      console.error("Failed to sync with Google Calendar:", calendarError);
    }

    return NextResponse.json(interview, { status: 201 });
  } catch (error) {
    console.error("Error creating interview:", error);
    return NextResponse.json(
      { error: "Failed to create interview" },
      { status: 500 }
    );
  }
}

// PATCH /api/interviews - Update an interview
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      interviewId,
      status,
      startedAt,
      completedAt,
      duration,
      videoRecordingUrl,
      audioRecordingUrl,
      aiAnalysisReport,
      overallScore,
      technicalScore,
      behavioralScore,
      communicationScore,
      settings,
    } = body;

    if (!interviewId) {
      return NextResponse.json(
        { error: "Interview ID required" },
        { status: 400 }
      );
    }

    // Check if user has permission to update
    const existingInterview = await prisma.interview.findUnique({
      where: { id: interviewId },
    });

    if (!existingInterview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    if (
      existingInterview.candidateId !== session.user.id &&
      existingInterview.interviewerId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const interview = await prisma.interview.update({
      where: { id: interviewId },
      data: {
        ...(status && { status }),
        ...(startedAt && { startedAt: new Date(startedAt) }),
        ...(completedAt && { completedAt: new Date(completedAt) }),
        ...(duration !== undefined && { duration }),
        ...(videoRecordingUrl && { videoRecordingUrl }),
        ...(audioRecordingUrl && { audioRecordingUrl }),
        ...(aiAnalysisReport && { aiAnalysisReport }),
        ...(overallScore !== undefined && { overallScore }),
        ...(technicalScore !== undefined && { technicalScore }),
        ...(behavioralScore !== undefined && { behavioralScore }),
        ...(communicationScore !== undefined && { communicationScore }),
        ...(settings && { settings: JSON.stringify(settings) }),
      },
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
        template: true,
        responses: true,
        evaluations: true,
      },
    });

    return NextResponse.json({ interview }, { status: 200 });
  } catch (error) {
    console.error("Error updating interview:", error);
    return NextResponse.json(
      { error: "Failed to update interview" },
      { status: 500 }
    );
  }
}
