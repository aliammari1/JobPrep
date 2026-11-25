/**
 * API route for synchronizing notifications
 * POST /api/notifications/sync - Sync notifications with server
 *
 * Returns real, user-scoped interview reminders derived from scheduled
 * interviews (next 24h, reminder not yet sent). Empty list when none.
 */

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * Handle POST requests to collect pending interview reminders for the
 * authenticated user.
 *
 * @returns `{ success: true, notifications: [...] }` scoped to the caller's
 * upcoming interviews, 401 when unauthenticated.
 */
export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcoming = await prisma.interview.findMany({
      where: {
        OR: [
          { candidateId: session.user.id },
          { interviewerId: session.user.id },
        ],
        status: { in: ["scheduled", "confirmed"] },
        reminderSent: false,
        scheduledAt: { gte: now, lte: in24h },
      },
      orderBy: { scheduledAt: "asc" },
      take: 20,
      select: {
        id: true,
        position: true,
        candidateName: true,
        scheduledAt: true,
      },
    });

    const pendingNotifications = upcoming.map((interview) => ({
      title: "Interview Reminder",
      body: `Your interview${interview.position ? ` for ${interview.position}` : ""} is at ${interview.scheduledAt?.toLocaleString() ?? "the scheduled time"}`,
      tag: `interview-reminder-${interview.id}`,
      data: {
        interviewId: interview.id,
        url: `/interview-room/${interview.id}`,
      },
    }));

    return NextResponse.json(
      {
        success: true,
        notifications: pendingNotifications,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[API] Error syncing notifications:", error);
    return NextResponse.json(
      { error: "Failed to sync notifications" },
      { status: 500 },
    );
  }
}
