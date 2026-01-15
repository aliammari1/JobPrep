import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Retrieve interview-related notifications for the authenticated interviewer.
 *
 * Fetches upcoming interviews within the next day and completed interviews from the last 7 days,
 * constructs reminder, confirmation, and completion notifications, sorts them newest-first, and returns them with a count.
 *
 * @returns An object containing `notifications` (array of notification objects) and `count` (total notifications). Responds with a 401 error JSON if the user is not authenticated, or a 500 error JSON on server failure.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get upcoming interviews that need reminders
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Interviews scheduled for tomorrow
    const upcomingInterviews = await prisma.interview.findMany({
      where: {
        interviewerId: session.user!.id,
        scheduledAt: {
          gte: now,
          lte: tomorrow,
        },
        status: {
          in: ["scheduled", "confirmed"],
        },
      },
      include: {
        candidate: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        scheduledAt: "asc",
      },
      take: 5,
    });

    // Get recently completed interviews
    const completedInterviews = await prisma.interview.findMany({
      where: {
        interviewerId: session.user!.id,
        status: "completed",
        completedAt: {
          gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      include: {
        candidate: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        completedAt: "desc",
      },
      take: 3,
    });

    // Build notifications
    const notifications = [];

    // Reminder notifications
    for (const interview of upcomingInterviews) {
      const settings = JSON.parse(interview.settings || "{}");
      const reminderSent = settings.reminderSent || false;

      const scheduledDate = new Date(interview.scheduledAt || Date.now());
      const timeStr = scheduledDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      notifications.push({
        id: `reminder-${interview.id}`,
        type: "reminder",
        title: "Interview Reminder",
        message: `${interview.candidate?.name} interview tomorrow at ${timeStr}`,
        timestamp: now,
        read: false,
        severity: "info",
        interviewId: interview.id,
        actionable: !reminderSent,
      });
    }

    // Confirmation notifications
    for (const interview of upcomingInterviews) {
      if (interview.status === "confirmed") {
        notifications.push({
          id: `confirmed-${interview.id}`,
          type: "confirmation",
          title: "Interview Confirmed",
          message: `${interview.candidate?.name} confirmed for interview`,
          timestamp: interview.updatedAt,
          read: false,
          severity: "success",
          interviewId: interview.id,
        });
      }
    }

    // Completion notifications
    for (const interview of completedInterviews) {
      notifications.push({
        id: `completed-${interview.id}`,
        type: "completion",
        title: "Interview Completed",
        message: `${interview.candidate?.name} interview completed`,
        timestamp: interview.completedAt || now,
        read: false,
        severity: "success",
        interviewId: interview.id,
      });
    }

    // Sort by timestamp (newest first)
    notifications.sort(
      (a, b) =>
        new Date(b.timestamp || 0).getTime() -
        new Date(a.timestamp || 0).getTime(),
    );

    return NextResponse.json({
      notifications,
      count: notifications.length,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}
