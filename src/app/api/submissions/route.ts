import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

// POST - Submit a solution
export async function POST(request: NextRequest) {
  try {
    // ✅ Add authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { challengeId, language, code, testResults, metrics, timeElapsed } =
      body;

    // Validate required fields
    if (!challengeId || !language || !code) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // ✅ Save to database - track for usage
    const submission = await prisma.codeSubmission.create({
      data: {
        userId: session.user.id,
        title: `Challenge ${challengeId}`,
        description: `Submitted solution in ${language}`,
        language,
        code,
        testsPassed: metrics.passedTests,
        totalTests: metrics.totalTests,
        status:
          metrics.passedTests === metrics.totalTests ? "passed" : "failed",
      },
    });

    return NextResponse.json(
      {
        id: submission.id,
        challengeId,
        userId: session.user.id,
        language,
        testResults,
        metrics,
        timeElapsed,
        status:
          metrics.passedTests === metrics.totalTests
            ? "ACCEPTED"
            : "WRONG_ANSWER",
        submittedAt: submission.createdAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error submitting solution:", error);
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
