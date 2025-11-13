import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Count interviews this month (both as candidate and interviewer)
    const interviewsCount = await prisma.interview.count({
      where: {
        OR: [
          {
            candidateId: session.user.id,
            createdAt: {
              gte: startOfMonth,
            },
          },
          {
            interviewerId: session.user.id,
            createdAt: {
              gte: startOfMonth,
            },
          },
        ],
      },
    });

    // Count AI mock sessions this month
    const aiMockSessionsCount = await prisma.aIMockSession.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // Count CVs - using LinkedInImportSession as a proxy for CV data stored
    const cvsCount = await prisma.linkedInImportSession.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // Count cover letters this month
    const coverLettersCount = await prisma.coverLetter.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // Count code challenges/submissions this month
    const codeChallengesCount = await prisma.codeSubmission.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    return NextResponse.json({
      interviews: interviewsCount,
      aiMockSessions: aiMockSessionsCount,
      cvs: cvsCount,
      coverLetters: coverLettersCount,
      codeChallenges: codeChallengesCount,
    });
  } catch (error) {
    console.error("Error fetching usage stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage stats" },
      { status: 500 }
    );
  }
}
