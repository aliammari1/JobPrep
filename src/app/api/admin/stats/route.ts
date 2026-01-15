import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/admin/stats - Get admin statistics
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user statistics
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        emailVerified: true,
        banned: true,
        createdAt: true,
        role: true,
      },
    });

    const totalUsers = users.length;
    const verifiedUsers = users.filter((u) => u.emailVerified).length;
    const bannedUsers = users.filter((u) => u.banned).length;

    // Active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeSessions = await prisma.session.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Get interview statistics
    const interviews = await prisma.interview.findMany({
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    });

    const totalInterviews = interviews.length;
    const scheduledInterviews = interviews.filter(
      (i) => i.status === "scheduled",
    ).length;
    const completedInterviews = interviews.filter(
      (i) => i.status === "completed",
    ).length;

    // Get template statistics
    const totalTemplates = await prisma.interviewTemplate.count();
    const publicTemplates = await prisma.interviewTemplate.count({
      where: { isPublic: true },
    });

    // Get organization statistics
    const totalOrganizations = await prisma.organization.count();

    const stats = {
      totalUsers,
      verifiedUsers,
      bannedUsers,
      activeUsers: activeSessions,
      totalInterviews,
      scheduledInterviews,
      completedInterviews,
      totalTemplates,
      publicTemplates,
      totalOrganizations,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 },
    );
  }
}
