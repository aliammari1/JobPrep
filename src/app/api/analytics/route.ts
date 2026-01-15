import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/analytics - Get analytics data
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const interviewId = searchParams.get("interviewId");

    // Get interview statistics
    const interviews = await prisma.interview.findMany({
      where: userId ? { candidateId: userId } : {},
      include: {
        analytics: true,
        evaluations: true,
      },
    });

    // Calculate aggregate statistics
    const totalInterviews = interviews.length;
    const completedInterviews = interviews.filter(
      (i) => i.status === "completed",
    ).length;
    const averageScore =
      interviews.reduce((sum, i) => sum + (i.overallScore || 0), 0) /
      (completedInterviews || 1);

    const categoryBreakdown = interviews.reduce((acc: any, interview) => {
      const category = interview.status;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    // Get specific interview analytics if requested
    if (interviewId) {
      const interviewAnalytics = await prisma.interviewAnalytics.findMany({
        where: { interviewId },
        include: {
          interview: {
            include: {
              candidate: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              template: {
                select: {
                  id: true,
                  title: true,
                  category: true,
                },
              },
            },
          },
        },
      });

      return NextResponse.json({
        interviewAnalytics,
        totalInterviews,
        completedInterviews,
        averageScore,
        categoryBreakdown,
      });
    }

    // Get all analytics for the user
    const analytics = await prisma.interviewAnalytics.findMany({
      where: userId
        ? {
            interview: {
              candidateId: userId,
            },
          }
        : {},
      include: {
        interview: {
          select: {
            id: true,
            scheduledAt: true,
            completedAt: true,
            status: true,
            overallScore: true,
            template: {
              select: {
                title: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      analytics,
      totalInterviews,
      completedInterviews,
      averageScore,
      categoryBreakdown,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}

// POST /api/analytics - Create analytics data
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
      interviewId,
      speechClarity,
      speechPace,
      fillerWords,
      confidence,
      eyeContact,
      facialExpressions,
      bodyLanguage,
      responseTime,
      accuracyScore,
      problemSolvingScore,
      attention,
      participation,
      analysisData,
    } = body;

    if (!interviewId) {
      return NextResponse.json(
        { error: "interviewId is required" },
        { status: 400 },
      );
    }

    const analytics = await prisma.interviewAnalytics.create({
      data: {
        interviewId,
        speechClarity,
        speechPace,
        fillerWords,
        confidence,
        eyeContact,
        facialExpressions: facialExpressions
          ? JSON.stringify(facialExpressions)
          : null,
        bodyLanguage: bodyLanguage ? JSON.stringify(bodyLanguage) : null,
        responseTime,
        accuracyScore,
        problemSolvingScore,
        attention,
        participation,
        analysisData: analysisData ? JSON.stringify(analysisData) : null,
      },
      include: {
        interview: {
          include: {
            candidate: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(analytics, { status: 201 });
  } catch (error) {
    console.error("Error creating analytics:", error);
    return NextResponse.json(
      { error: "Failed to create analytics" },
      { status: 500 },
    );
  }
}
