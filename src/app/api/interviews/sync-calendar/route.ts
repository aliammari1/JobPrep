import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createGoogleCalendarEvent } from "@/lib/google-calendar";

// POST /api/interviews/sync-calendar - Sync existing interviews to Google Calendar
export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all scheduled interviews for the user that haven't been synced yet
    const interviews = await prisma.interview.findMany({
      where: {
        OR: [
          { candidateId: session.user.id },
          { interviewerId: session.user.id },
        ],
        status: {
          in: ["scheduled", "confirmed"],
        },
        scheduledAt: {
          not: null,
        },
      },
    });

    let syncedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const interview of interviews) {
      try {
        // Check if already synced
        const settings = interview.settings
          ? JSON.parse(interview.settings)
          : {};
        
        if (settings.googleCalendarEventId) {
          skippedCount++;
          continue;
        }

        // Sync to Google Calendar
        if (interview.scheduledAt) {
          const result = await createGoogleCalendarEvent(
            session.user.id,
            {
              summary: `Interview: ${settings.position || "Position"} - ${settings.candidateName || "Candidate"}`,
              description: `Interview Details:\n\nPosition: ${settings.position || "N/A"}\nCandidate: ${settings.candidateName || "N/A"}\nEmail: ${settings.candidateEmail || "N/A"}\nPhone: ${settings.candidatePhone || "N/A"}\nType: ${settings.type || "video"}\n\nNotes:\n${settings.notes || "No additional notes"}`,
              start: {
                dateTime: new Date(interview.scheduledAt).toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              },
              end: {
                dateTime: new Date(
                  new Date(interview.scheduledAt).getTime() +
                    (interview.duration || 60) * 60000
                ).toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              },
              attendees: settings.candidateEmail
                ? [{ email: settings.candidateEmail }]
                : [],
            }
          );

          if (result.success && result.eventId) {
            // Update interview with calendar event ID
            await prisma.interview.update({
              where: { id: interview.id },
              data: {
                settings: JSON.stringify({
                  ...settings,
                  googleCalendarEventId: result.eventId,
                }),
              },
            });
            syncedCount++;
          }
        }
      } catch (error) {
        console.error(
          `Failed to sync interview ${interview.id}:`,
          error
        );
        errors.push(`Interview ${interview.id}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      synced: syncedCount,
      skipped: skippedCount,
      total: interviews.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error syncing interviews to calendar:", error);
    return NextResponse.json(
      { error: "Failed to sync interviews to calendar" },
      { status: 500 }
    );
  }
}
