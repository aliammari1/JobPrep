import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createGoogleCalendarEvent } from "@/lib/google-calendar";

function safeParseSettings(settings: unknown): Record<string, any> {
  if (!settings) return {};
  if (typeof settings === "string") {
    try {
      const parsed = JSON.parse(settings);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }
  return typeof settings === "object" ? (settings as Record<string, any>) : {};
}

function serializeInterview<T extends Record<string, any>>(interview: T) {
  return {
    ...interview,
    scheduledAt:
      interview.scheduledAt instanceof Date
        ? interview.scheduledAt.toISOString()
        : (interview.scheduledAt ?? null),
    startedAt:
      interview.startedAt instanceof Date
        ? interview.startedAt.toISOString()
        : (interview.startedAt ?? null),
    completedAt:
      interview.completedAt instanceof Date
        ? interview.completedAt.toISOString()
        : (interview.completedAt ?? null),
    createdAt:
      interview.createdAt instanceof Date
        ? interview.createdAt.toISOString()
        : interview.createdAt,
    updatedAt:
      interview.updatedAt instanceof Date
        ? interview.updatedAt.toISOString()
        : interview.updatedAt,
  };
}

// GET /api/interviews - Get all interviews with filters
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const candidateId = searchParams.get("candidateId");
    const interviewerId = searchParams.get("interviewerId");
    const templateId = searchParams.get("templateId");
    const page = Math.max(
      1,
      Number.parseInt(searchParams.get("page") || "1", 10) || 1,
    );
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(searchParams.get("limit") || "20", 10) || 20),
    );
    const skip = (page - 1) * limit;

    const where: Record<string, any> = {
      OR: [
        { candidateId: session.user.id },
        { interviewerId: session.user.id },
      ],
    };

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

    // Get total count for pagination
    const total = await prisma.interview.count({ where });

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
      skip,
      take: limit,
    });

    return NextResponse.json({
      interviews: interviews.map(serializeInterview),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch interviews" },
      { status: 500 },
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
      candidateName,
      position,
      candidateEmail,
      candidatePhone,
      notes,
      type,
      duration,
      time,
      status,
    } = body;

    const settingsData = safeParseSettings(settings);

    // Validate required fields
    const resolvedCandidateId = candidateId || session.user.id;

    let parsedScheduledAt: Date | null = null;
    if (scheduledAt) {
      const candidateDate = new Date(scheduledAt);
      if (Number.isNaN(candidateDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid scheduledAt date" },
          { status: 400 },
        );
      }
      parsedScheduledAt = candidateDate;
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

    const resolvedTime =
      time ||
      settingsData.time ||
      (parsedScheduledAt
        ? `${parsedScheduledAt.getHours().toString().padStart(2, "0")}:${parsedScheduledAt.getMinutes().toString().padStart(2, "0")}`
        : null);

    // Create the interview
    const interview = await prisma.interview.create({
      data: {
        candidateId: resolvedCandidateId,
        interviewerId: interviewerId || session.user.id,
        templateId: finalTemplateId,
        scheduledAt: parsedScheduledAt,
        time: resolvedTime,
        duration:
          duration ??
          (typeof settingsData.duration === "number"
            ? settingsData.duration
            : 60),
        type: type || settingsData.type || "video",
        candidateName: candidateName ?? settingsData.candidateName ?? null,
        position: position ?? settingsData.position ?? null,
        candidateEmail: candidateEmail ?? settingsData.candidateEmail ?? null,
        candidatePhone: candidatePhone ?? settingsData.candidatePhone ?? null,
        notes: notes ?? settingsData.notes ?? null,
        isAIInterviewer: isAIInterviewer || false,
        allowRecording: allowRecording !== undefined ? allowRecording : true,
        settings:
          Object.keys(settingsData).length > 0
            ? JSON.stringify(settingsData)
            : null,
        status: status || "scheduled",
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
      if (parsedScheduledAt) {
        const result = await createGoogleCalendarEvent(session.user.id, {
          summary: `Interview: ${interview.position || "Position"} - ${interview.candidateName || "Candidate"}`,
          description: `Interview Details:\n\nPosition: ${interview.position || "N/A"}\nCandidate: ${interview.candidateName || "N/A"}\nEmail: ${interview.candidateEmail || "N/A"}\nPhone: ${interview.candidatePhone || "N/A"}\nType: ${interview.type || "video"}\n\nNotes:\n${interview.notes || "No additional notes"}`,
          startTime: parsedScheduledAt,
          endTime: new Date(
            parsedScheduledAt.getTime() + (interview.duration || 60) * 60000,
          ),
          attendees: interview.candidateEmail
            ? [
                {
                  email: interview.candidateEmail,
                  displayName: interview.candidateName || undefined,
                },
              ]
            : [],
        });

        if (result.success && result.eventId) {
          // Update interview with calendar event ID
          await prisma.interview.update({
            where: { id: interview.id },
            data: {
              isCalendarSynced: true,
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

    return NextResponse.json(serializeInterview(interview), { status: 201 });
  } catch (error) {
    console.error("Error creating interview:", error);
    return NextResponse.json(
      { error: "Failed to create interview" },
      { status: 500 },
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
        { status: 400 },
      );
    }

    // Check if user has permission to update
    const existingInterview = await prisma.interview.findUnique({
      where: { id: interviewId },
    });

    if (!existingInterview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 },
      );
    }

    if (
      existingInterview.candidateId !== session.user.id &&
      existingInterview.interviewerId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
        ...(settings !== undefined && {
          settings:
            typeof settings === "string" ? settings : JSON.stringify(settings),
        }),
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

    return NextResponse.json(
      { interview: serializeInterview(interview) },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating interview:", error);
    return NextResponse.json(
      { error: "Failed to update interview" },
      { status: 500 },
    );
  }
}
