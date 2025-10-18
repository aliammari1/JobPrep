import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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

    const where: any = {};

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

    return NextResponse.json(interviews);
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
    if (!candidateId || !templateId) {
      return NextResponse.json(
        { error: "candidateId and templateId are required" },
        { status: 400 }
      );
    }

    // Create the interview
    const interview = await prisma.interview.create({
      data: {
        candidateId,
        interviewerId,
        templateId,
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

    return NextResponse.json(interview, { status: 201 });
  } catch (error) {
    console.error("Error creating interview:", error);
    return NextResponse.json(
      { error: "Failed to create interview" },
      { status: 500 }
    );
  }
}
