import { NextRequest, NextResponse } from "next/server";

// POST - Submit a solution
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      challengeId,
      userId,
      language,
      code,
      testResults,
      metrics,
      timeElapsed,
    } = body;

    // TODO: Add authentication
    // const session = await getServerSession();
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Validate required fields
    if (!challengeId || !language || !code) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // TODO: Save to database
    // const submission = await prisma.codeSubmission.create({
    //   data: {
    //     challengeId,
    //     userId: session.user.id,
    //     language,
    //     code,
    //     testResults,
    //     metrics,
    //     timeElapsed,
    //     status: metrics.passedTests === metrics.totalTests ? 'ACCEPTED' : 'WRONG_ANSWER',
    //   },
    // });

    const submission = {
      id: Date.now().toString(),
      challengeId,
      userId: userId || "anonymous",
      language,
      code,
      testResults,
      metrics,
      timeElapsed,
      status: metrics.passedTests === metrics.totalTests ? "ACCEPTED" : "WRONG_ANSWER",
      submittedAt: new Date().toISOString(),
    };

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("Error submitting solution:", error);
    return NextResponse.json(
      { error: "Failed to submit solution" },
      { status: 500 }
    );
  }
}

// GET - Fetch user's submissions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const challengeId = searchParams.get("challengeId");
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    // TODO: Add authentication and fetch from database
    // const session = await getServerSession();
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // const submissions = await prisma.codeSubmission.findMany({
    //   where: {
    //     userId: session.user.id,
    //     ...(challengeId && { challengeId }),
    //   },
    //   orderBy: { submittedAt: 'desc' },
    //   take: limit,
    //   skip: offset,
    // });

    // Mock data for development
    const submissions = [
      {
        id: "1",
        challengeId: "1",
        language: "javascript",
        status: "ACCEPTED",
        metrics: {
          passedTests: 5,
          totalTests: 5,
          avgExecutionTime: 45.2,
        },
        submittedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    return NextResponse.json({
      submissions,
      total: submissions.length,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
