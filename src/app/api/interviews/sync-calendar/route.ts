import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createGoogleCalendarEvent, updateGoogleCalendarEvent, fetchGoogleCalendarEvents } from "@/lib/google-calendar";

// POST /api/interviews/sync-calendar - Bidirectional sync between JobPrep and Google Calendar
export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let jobPrepToGoogleSynced = 0;
    let googleToJobPrepSynced = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    // ============================================
    // DIRECTION 1: JobPrep → Google Calendar
    // ============================================
    try {
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

      for (const interview of interviews) {
        try {
          const settings = interview.settings
            ? JSON.parse(interview.settings)
            : {};
          
          // Check if already synced
          if (settings.googleCalendarEventId) {
            // Check if we need to update the event
            if (interview.updatedAt > (settings.lastSyncedAt ? new Date(settings.lastSyncedAt) : new Date(0))) {
              const updateResult = await updateGoogleCalendarEvent(
                session.user.id,
                settings.googleCalendarEventId,
                {
                  summary: `Interview: ${settings.position || "Position"} - ${settings.candidateName || "Candidate"}`,
                  description: `Interview Details:\n\nPosition: ${settings.position || "N/A"}\nCandidate: ${settings.candidateName || "N/A"}\nEmail: ${settings.candidateEmail || "N/A"}\nPhone: ${settings.candidatePhone || "N/A"}\nType: ${settings.type || "video"}\n\nNotes:\n${settings.notes || "No additional notes"}`,
                  start: {
                    dateTime: new Date(interview.scheduledAt!).toISOString(),
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  },
                  end: {
                    dateTime: new Date(
                      new Date(interview.scheduledAt!).getTime() +
                        (interview.duration || 60) * 60000
                    ).toISOString(),
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  },
                  attendees: settings.candidateEmail
                    ? [{ email: settings.candidateEmail }]
                    : [],
                }
              );

              if (updateResult.success) {
                // Update last synced timestamp
                await prisma.interview.update({
                  where: { id: interview.id },
                  data: {
                    settings: JSON.stringify({
                      ...settings,
                      lastSyncedAt: new Date().toISOString(),
                    }),
                  },
                });
                jobPrepToGoogleSynced++;
              }
            } else {
              skippedCount++;
            }
            continue;
          }

          // Create new event in Google Calendar
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
                    lastSyncedAt: new Date().toISOString(),
                  }),
                },
              });
              jobPrepToGoogleSynced++;
            }
          }
        } catch (error) {
          console.error(
            `Failed to sync interview ${interview.id} to Google Calendar:`,
            error
          );
          errors.push(`Interview ${interview.id}: ${String(error)}`);
        }
      }
    } catch (error) {
      console.error("Error in JobPrep → Google Calendar sync:", error);
      errors.push(`JobPrep → Google sync failed: ${String(error)}`);
    }

    // ============================================
    // DIRECTION 2: Google Calendar → JobPrep
    // ============================================
    try {
      const googleCalendarEvents = await fetchGoogleCalendarEvents(session.user.id);

      for (const event of googleCalendarEvents) {
        try {
          // Skip events that are already synced (have jobprep event id in description)
          if (!event.start?.dateTime) continue;
          if (event.summary.includes("Interview:")) {
            // Check if this event is already synced to JobPrep
            const existingInterview = await prisma.interview.findFirst({
              where: {
                settings: {
                  contains: event.id,
                },
              },
            });

            if (existingInterview) {
              continue; // Already synced
            }

            // Get the template - use first available or a default
            const template = await prisma.interviewTemplate.findFirst({
              where: {
                createdBy: session.user.id,
              },
            });

            if (!template) {
              console.warn("No interview template found for user, skipping Google Calendar event");
              continue;
            }

            // Create interview in JobPrep from Google Calendar event
            const eventStart = new Date(event.start.dateTime);
            const eventEnd = new Date(event.end.dateTime);
            const duration = Math.round((eventEnd.getTime() - eventStart.getTime()) / 60000);

            // Extract candidate email from attendees if available
            const candidateEmail = event.attendees?.[0]?.email || "";

            const newInterview = await prisma.interview.create({
              data: {
                candidateId: session.user.id, // Use current user as candidate (can be updated)
                interviewerId: session.user.id,
                templateId: template.id,
                status: "scheduled",
                scheduledAt: eventStart,
                duration: duration,
                settings: JSON.stringify({
                  googleCalendarEventId: event.id,
                  candidateName: event.summary.replace("Interview: ", "").split(" - ")[1] || "Candidate",
                  position: event.summary.replace("Interview: ", "").split(" - ")[0] || "Position",
                  candidateEmail: candidateEmail,
                  type: "video",
                  lastSyncedAt: new Date().toISOString(),
                  syncedFromGoogle: true,
                }),
              },
            });

            googleToJobPrepSynced++;
          }
        } catch (error) {
          console.error(
            `Failed to sync Google Calendar event ${event.id} to JobPrep:`,
            error
          );
          errors.push(`Google event ${event.id}: ${String(error)}`);
        }
      }
    } catch (error) {
      console.error("Error in Google Calendar → JobPrep sync:", error);
      errors.push(`Google → JobPrep sync failed: ${String(error)}`);
    }

    return NextResponse.json({
      success: true,
      jobPrepToGoogle: jobPrepToGoogleSynced,
      googleToJobPrep: googleToJobPrepSynced,
      skipped: skippedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error syncing interviews with calendar:", error);
    return NextResponse.json(
      { error: "Failed to sync interviews with calendar" },
      { status: 500 }
    );
  }
}
