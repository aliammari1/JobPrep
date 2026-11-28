import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { captureApiError } from "@/lib/observability";
import prisma from "@/lib/prisma";

// POST - Submit a solution
export async function POST(request: NextRequest) {
  let userId: string | undefined;
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = session.user.id;

    const body = await request.json();
    const {
      challengeId,
      applicationId,
      language,
      code,
      testResults,
      metrics,
      timeElapsed,
    } = body;

    if (!challengeId || !language || !code) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const [challenge, linkedApp] = await Promise.all([
      prisma.challenge.findUnique({
        where: { id: challengeId },
        select: { id: true, title: true },
      }),
      typeof applicationId === "string" && applicationId.trim()
        ? prisma.jobApplication.findFirst({
            where: { id: applicationId, userId },
            select: { id: true },
          })
        : Promise.resolve(null),
    ]);

    const submission = await prisma.codeSubmission.create({
      data: {
        userId,
        challengeId: challenge?.id ?? null,
        applicationId: linkedApp?.id ?? null,
        title: challenge?.title ?? `Challenge ${challengeId}`,
        description: `Submitted solution in ${language}`,
        language,
        code,
        testsPassed: metrics?.passedTests ?? 0,
        totalTests: metrics?.totalTests ?? 0,
        status:
          metrics && metrics.passedTests === metrics.totalTests
            ? "passed"
            : "failed",
      },
    });

    return NextResponse.json(
      {
        id: submission.id,
        challengeId,
        applicationId: submission.applicationId,
        userId,
        language,
        testResults,
        metrics,
        timeElapsed,
        status:
          metrics && metrics.passedTests === metrics.totalTests
            ? "ACCEPTED"
            : "WRONG_ANSWER",
        submittedAt: submission.createdAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    captureApiError("POST /api/submissions", error, { userId });
    return NextResponse.json(
      { error: "Failed to submit solution" },
      { status: 500 },
    );
  }
}

// GET - Fetch user's submissions
export async function GET(request: NextRequest) {
  try {
    // ✅ Add authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    // ✅ Fetch from database
    const [submissions, total] = await Promise.all([
      prisma.codeSubmission.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.codeSubmission.count({
        where: { userId: session.user.id },
      }),
    ]);

    return NextResponse.json({
      submissions: submissions.map((s) => ({
        id: s.id,
        title: s.title,
        language: s.language,
        status: s.status,
        testsPassed: s.testsPassed,
        totalTests: s.totalTests,
        createdAt: s.createdAt.toISOString(),
      })),
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 },
    );
  }
}
