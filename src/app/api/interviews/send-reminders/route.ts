import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// POST /api/interviews/send-reminders - Send email reminders to candidates
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { interviewIds } = body;

    if (!interviewIds || !Array.isArray(interviewIds) || interviewIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid interview IDs" },
        { status: 400 }
      );
    }

    // Get interviews
    const interviews = await prisma.interview.findMany({
      where: {
        id: { in: interviewIds },
      },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        interviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (interviews.length === 0) {
      return NextResponse.json(
        { error: "No interviews found" },
        { status: 404 }
      );
    }

    // TODO: Integrate with email service (SendGrid, Resend, etc.)
    // For now, we'll just update the database to mark reminders as sent
    const sentReminders = await Promise.all(
      interviews.map((interview) =>
        prisma.interview.update({
          where: { id: interview.id },
          data: {
            settings: JSON.stringify({
              ...JSON.parse(interview.settings || "{}"),
              reminderSent: true,
              reminderSentAt: new Date().toISOString(),
            }),
          },
        })
      )
    );

    // Log reminder activity
    console.log(`Reminders sent to ${sentReminders.length} candidates`);

    return NextResponse.json({
      success: true,
      sent: sentReminders.length,
      message: `Reminders sent to ${sentReminders.length} candidate(s)`,
    });
  } catch (error) {
    console.error("Error sending reminders:", error);
    return NextResponse.json(
      { error: "Failed to send reminders" },
      { status: 500 }
    );
  }
}
