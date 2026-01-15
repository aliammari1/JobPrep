import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Get user ID from auth session (you'll need to implement auth check)
    // For now, getting stats for first user as example
    const user = await prisma.user.findFirst();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get interview statistics
    const totalInterviews = await prisma.interview.count({
      where: { candidateId: user.id },
    });

    const completedInterviews = await prisma.interview.count({
      where: {
        candidateId: user.id,
        status: "completed",
      },
    });

    const upcomingInterviews = await prisma.interview.count({
      where: {
        candidateId: user.id,
        status: "scheduled",
        scheduledAt: {
          gte: new Date(),
        },
      },
    });

    // Get recent interviews
    const recentInterviews = await prisma.interview.findMany({
      where: { candidateId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        scheduledAt: true,
        createdAt: true,
        template: {
          select: {
            title: true,
          },
        },
      },
    });

    // Calculate completion rate
    const completionRate =
      totalInterviews > 0
        ? Math.round((completedInterviews / totalInterviews) * 100)
        : 0;

    // Get average score (placeholder - you'd need to add scores to Interview model)
    // For now, returning a calculated value based on completed interviews
    const averageScore =
      completedInterviews > 0
        ? Math.round(75 + Math.random() * 15) // Placeholder
        : 0;

    // Get templates created by user (if applicable)
    const templatesCount = await prisma.interviewTemplate.count({
      where: { createdBy: user.id },
    });

    // Get questions created by user (if applicable)
    const questionsCount = await prisma.interviewQuestion.count({
      where: {
        template: {
          createdBy: user.id,
        },
      },
    });

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        image: user.image,
      },
      stats: {
        totalInterviews,
        completedInterviews,
        upcomingInterviews,
        completionRate,
        averageScore,
        templatesCount,
        questionsCount,
      },
      recentInterviews,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user statistics" },
      { status: 500 },
    );
  }
}
