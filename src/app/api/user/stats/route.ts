import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { captureApiError } from "@/lib/observability";
import prisma from "@/lib/prisma";

export async function GET() {
  let userId: string | undefined;
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    userId = session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, image: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const sixWeeksAgo = new Date();
    sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42);

    const [
      totalInterviews,
      completedInterviews,
      upcomingInterviews,
      recentInterviews,
      interviewScoreAgg,
      totalMockSessions,
      mockScoreAgg,
      recentMockSessions,
      templatesCount,
      questionsCount,
      applications,
      systemDesignCount,
      systemDesignAgg,
      recentSystemDesigns,
      codeSubmissionsTotal,
      codeSubmissionsPassed,
      recentCodeSubmissions,
      cvCount,
      coverLetterCount,
    ] = await Promise.all([
      prisma.interview.count({ where: { candidateId: user.id } }),
      prisma.interview.count({
        where: { candidateId: user.id, status: "completed" },
      }),
      prisma.interview.count({
        where: {
          candidateId: user.id,
          status: "scheduled",
          scheduledAt: { gte: new Date() },
        },
      }),
      prisma.interview.findMany({
        where: { candidateId: user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          status: true,
          overallScore: true,
          scheduledAt: true,
          createdAt: true,
          template: { select: { title: true } },
        },
      }),
      prisma.interview.aggregate({
        _avg: { overallScore: true },
        _count: { overallScore: true },
        where: {
          candidateId: user.id,
          status: "completed",
          overallScore: { not: null },
        },
      }),
      prisma.aIMockSession.count({ where: { userId: user.id } }),
      prisma.aIMockSession.aggregate({
        _avg: { overallScore: true },
        _count: { overallScore: true },
        where: { userId: user.id, overallScore: { not: null } },
      }),
      prisma.aIMockSession.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          sessionType: true,
          overallScore: true,
          createdAt: true,
          application: { select: { id: true, company: true, role: true } },
        },
      }),
      prisma.interviewTemplate.count({ where: { createdBy: user.id } }),
      prisma.interviewQuestion.count({
        where: { template: { createdBy: user.id } },
      }),
      prisma.jobApplication.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        include: {
          _count: {
            select: {
              cvs: true,
              coverLetters: true,
              mockSessions: true,
              interviews: true,
              systemDesignSessions: true,
              codeSubmissions: true,
            },
          },
        },
      }),
      prisma.systemDesignSession.count({ where: { userId: user.id } }),
      prisma.systemDesignSession.aggregate({
        _avg: { score: true },
        _count: { score: true },
        where: { userId: user.id, score: { not: null } },
      }),
      prisma.systemDesignSession.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        take: 10,
        select: {
          id: true,
          title: true,
          score: true,
          updatedAt: true,
          createdAt: true,
        },
      }),
      prisma.codeSubmission.count({ where: { userId: user.id } }),
      prisma.codeSubmission.count({
        where: { userId: user.id, status: "passed" },
      }),
      prisma.codeSubmission.findMany({
        where: { userId: user.id, createdAt: { gte: sixWeeksAgo } },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          title: true,
          language: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.cV.count({ where: { userId: user.id } }),
      prisma.coverLetter.count({ where: { userId: user.id } }),
    ]);

    // Real combined practice counts (Live Interviews + AI Mock Sessions)
    const totalPracticeSessions = totalInterviews + totalMockSessions;
    const completedPracticeSessions = completedInterviews + totalMockSessions;
    const completionRate =
      totalPracticeSessions > 0
        ? Math.round((completedPracticeSessions / totalPracticeSessions) * 100)
        : 0;

    // Exact unweighted mean of all scored interviews + scored AI mock sessions
    const liveScoredCount = interviewScoreAgg._count.overallScore ?? 0;
    const mockScoredCount = mockScoreAgg._count.overallScore ?? 0;
    const scoredInterviews = liveScoredCount + mockScoredCount;
    const weightedSum =
      (interviewScoreAgg._avg.overallScore ?? 0) * liveScoredCount +
      (mockScoreAgg._avg.overallScore ?? 0) * mockScoredCount;
    const averageScore =
      scoredInterviews > 0 ? Math.round(weightedSum / scoredInterviews) : null;

    const scoredSystemDesigns = systemDesignAgg._count.score ?? 0;
    const avgSystemDesignScore =
      scoredSystemDesigns > 0 && systemDesignAgg._avg.score !== null
        ? Math.round(systemDesignAgg._avg.score)
        : null;

    // Real ATS average across applications that actually have a computed ATS score
    const scoredApps = applications.filter(
      (a) => typeof a.atsScore === "number",
    );
    const avgAtsScore =
      scoredApps.length > 0
        ? Math.round(
            scoredApps.reduce((acc, a) => acc + (a.atsScore ?? 0), 0) /
              scoredApps.length,
          )
        : null;

    // Real stage breakdown
    const stageCounts = {
      saved: 0,
      applied: 0,
      screening: 0,
      onsite: 0,
      offer: 0,
    };
    for (const app of applications) {
      if (app.stage in stageCounts) {
        stageCounts[app.stage as keyof typeof stageCounts] += 1;
      }
    }

    // Unified real activity stream across PostgreSQL tables
    const recentActivity = [
      ...recentMockSessions.map((m) => ({
        id: `mock-${m.id}`,
        kind: "mock" as const,
        title: m.application
          ? `${m.application.role} · ${m.application.company}`
          : `${m.sessionType || "Mock"} Interview`,
        status: "completed",
        score: m.overallScore !== null ? Math.round(m.overallScore) : null,
        href: `/saved-interviews/${m.id}`,
        createdAt: m.createdAt.toISOString(),
      })),
      ...recentInterviews.map((i) => ({
        id: `live-${i.id}`,
        kind: "interview" as const,
        title: i.template?.title || "Scheduled Interview",
        status: i.status,
        score: i.overallScore !== null ? Math.round(i.overallScore) : null,
        href: "/recordings",
        createdAt: i.createdAt.toISOString(),
      })),
      ...recentSystemDesigns.map((sd) => ({
        id: `sd-${sd.id}`,
        kind: "system-design" as const,
        title: sd.title,
        status: sd.score !== null ? "reviewed" : "saved",
        score: sd.score,
        href: "/system-design",
        createdAt: sd.createdAt.toISOString(),
      })),
      ...recentCodeSubmissions.map((cs) => ({
        id: `code-${cs.id}`,
        kind: "code" as const,
        title: `${cs.title} (${cs.language})`,
        status: cs.status,
        score: null,
        href: "/code-challenge",
        createdAt: cs.createdAt.toISOString(),
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 12);

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        image: user.image,
      },
      stats: {
        totalInterviews: totalPracticeSessions,
        completedInterviews: completedPracticeSessions,
        upcomingInterviews,
        completionRate,
        averageScore,
        scoredInterviews,
        templatesCount,
        questionsCount,
        applicationsCount: applications.length,
        avgAtsScore,
        stageCounts,
        systemDesignCount,
        scoredSystemDesigns,
        avgSystemDesignScore,
        codeSubmissionsTotal,
        codeSubmissionsPassed,
        cvCount,
        coverLetterCount,
      },
      recentActivity,
      recentInterviews: recentInterviews.map((item) => ({
        id: item.id,
        status: item.status,
        scheduledAt: item.scheduledAt ? item.scheduledAt.toISOString() : null,
        createdAt: item.createdAt.toISOString(),
        template: item.template,
      })),
      activeApplications: applications.slice(0, 5).map((app) => ({
        id: app.id,
        company: app.company,
        role: app.role,
        location: app.location ?? "",
        stage: app.stage,
        atsScore: app.atsScore,
        hasJobDescription: app.jobDescription.trim().length > 0,
        counts: app._count,
        updatedAt: app.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    captureApiError("GET /api/user/stats", error, { userId });
    return NextResponse.json(
      { error: "Failed to fetch user statistics" },
      { status: 500 },
    );
  }
}
