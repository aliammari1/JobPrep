import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Handles POST requests to mark the given interviews as having reminders sent.
 *
 * @returns A JSON response. On success: `{ success: true, sent: number, message: string }` where `sent` is the number of interviews updated. On error: `{ error: string }` with an appropriate HTTP status (`401` for unauthorized, `400` for invalid input, `404` if no interviews found, `500` for internal failures).
 */
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

    if (
      !interviewIds ||
      !Array.isArray(interviewIds) ||
      interviewIds.length === 0
    ) {
      return NextResponse.json(
        { error: "Invalid interview IDs" },
        { status: 400 },
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
        { status: 404 },
      );
    }

    // Integrate with email service (SendGrid, Resend, etc.)
    // Send reminder emails to both interviewer and candidate
    const { sendEmail } = await import("@/lib/email-service");

    const emailPromises = interviews.flatMap((interview) => {
      const reminderEmails = [];
      const interviewTime =
        interview.time ||
        interview.scheduledAt?.toLocaleString() ||
        "Unknown time";

      // Email to interviewer
      if (interview.interviewer?.email) {
        reminderEmails.push(
          sendEmail({
            to: interview.interviewer.email,
            subject: `Upcoming Interview Reminder: ${interview.candidateName}`,
            html: `<p>You have an upcoming interview with <strong>${interview.candidateName}</strong></p>
                   <p>Position: ${interview.position || "Not specified"}</p>
                   <p>Scheduled for: ${interviewTime}</p>
                   <p><a href="http://localhost:3000/interview-room/${interview.id}">Join Interview</a></p>`,
          }).catch((err) =>
            console.error("Failed to send interviewer email:", err),
          ),
        );
      }

      // Email to candidate
      if (interview.candidateEmail) {
        reminderEmails.push(
          sendEmail({
            to: interview.candidateEmail,
            subject: `Upcoming Interview Reminder: ${interview.position}`,
            html: `<p>You have an upcoming interview for <strong>${interview.position}</strong></p>
                   <p>Interviewer: ${interview.interviewer?.name || "Not assigned"}</p>
                   <p>Scheduled for: ${interviewTime}</p>
                   <p><a href="http://localhost:3000/interview-room/${interview.id}">Join Interview</a></p>`,
          }).catch((err) =>
            console.error("Failed to send candidate email:", err),
          ),
        );
      }

      return reminderEmails;
    });

    // Wait for all emails to be sent
    await Promise.allSettled(emailPromises);

    // Mark reminders as sent in database using batch update for performance
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
        }),
      ),
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
      { status: 500 },
    );
  }
}
