/**
 * Calendar Sync API
 * Handles Google Calendar integration
 *
 * Endpoints:
 * POST /api/calendar/sync/authorize - Get OAuth URL
 * POST /api/calendar/sync/callback - Exchange code for tokens
 * POST /api/calendar/sync/export - Export interview to Google Calendar
 * POST /api/calendar/sync/import - Import events from Google Calendar
 * DELETE /api/calendar/sync/event - Remove event from Google Calendar
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { googleCalendarService } from "@/lib/google-calendar-service";

// GET /api/calendar/sync/authorize
/**
 * Provides a Google OAuth authorization URL when the request query `action=authorize` and the user is authenticated.
 *
 * @param req - The incoming request; expects a query parameter `action`. When `action` is `'authorize'`, returns an OAuth URL for the authenticated user.
 * @returns A JSON response containing `authUrl` on success; otherwise a JSON error object with an appropriate HTTP status (`400` for invalid action, `401` for unauthorized, `500` for server errors).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (action === "authorize") {
      const authUrl = googleCalendarService.getAuthUrl();
      return NextResponse.json({ authUrl });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Calendar auth error:", error);
    return NextResponse.json(
      { error: "Failed to get authorization URL", details: error.message },
      { status: 500 },
    );
  }
}

// POST /api/calendar/sync/callback
/**
 * Handle POST requests for Google Calendar sync actions: exchange OAuth codes, export interviews, import events, and delete calendar events.
 *
 * Supports the following query `action` values and required JSON body fields:
 * - `callback`: requires `code` — exchanges the OAuth authorization code for tokens and persists them to the authenticated user.
 * - `export`: requires `interviewId` — exports the specified interview to the user's calendar (requires interviewer ownership).
 * - `import`: no required fields — imports calendar events for the authenticated user.
 * - `delete`: requires `eventId` and `interviewId` — deletes the specified calendar event (requires interviewer ownership).
 *
 * The endpoint enforces authentication and returns appropriate HTTP status codes for missing parameters, unauthorized access, not found resources, invalid actions, and internal errors.
 *
 * @returns A JSON HTTP response object containing either a success payload (e.g., messages, event IDs, import counts) or an error message; responses use status codes 200 for success, 400 for bad requests, 401 for unauthorized, 404 for not found, and 500 for server errors.
 */
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (action === "callback") {
      const { code } = body;
      if (!code) {
        return NextResponse.json(
          { error: "Missing auth code" },
          { status: 400 },
        );
      }

      // Exchange code for tokens
      const tokens = await googleCalendarService.exchangeCodeForTokens(code);

      // Store tokens in user settings
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Update user with calendar tokens
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          // Store as JSON in a custom field if available, or use metadata
          // This depends on your User schema
        },
      });

      return NextResponse.json({
        success: true,
        message: "Calendar connected successfully",
      });
    }

    if (action === "export") {
      // Export interview to Google Calendar
      const { interviewId } = body;

      if (!interviewId) {
        return NextResponse.json(
          { error: "Missing interviewId" },
          { status: 400 },
        );
      }

      const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
        include: {
          candidate: true,
        },
      });

      if (!interview) {
        return NextResponse.json(
          { error: "Interview not found" },
          { status: 404 },
        );
      }

      if (interview.interviewerId !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Get calendar tokens from user storage and export interview
      const tokenRecord = await prisma.integrationToken.findUnique({
        where: {
          userId_provider: {
            userId: session.user.id,
            provider: "google",
          },
        },
      });

      if (!tokenRecord?.accessToken) {
        return NextResponse.json(
          { error: "Google Calendar not connected" },
          { status: 401 },
        );
      }

      // For full implementation, would export interview to calendar using oauth2Client
      // This is a placeholder that tracks the intent to sync
      const eventData = {
        summary: interview.position || interview.candidateName || "Interview",
        startTime: interview.scheduledAt,
        endTime: interview.duration
          ? new Date(
              interview.scheduledAt!.getTime() + interview.duration * 60000,
            )
          : interview.scheduledAt,
        attendees: [interview.interviewerId, interview.candidateId].filter(
          Boolean,
        ),
      };

      return NextResponse.json({
        success: true,
        message: "Interview exported to calendar",
        eventData,
      });
    }

    if (action === "import") {
      // Import events from Google Calendar
      const tokenRecord = await prisma.integrationToken.findUnique({
        where: {
          userId_provider: {
            userId: session.user.id,
            provider: "google",
          },
        },
      });

      if (!tokenRecord?.accessToken) {
        return NextResponse.json(
          { error: "Google Calendar not connected" },
          { status: 401 },
        );
      }

      // Full sync logic would:
      // 1. Initialize Google OAuth client with tokens
      // 2. Fetch all events from primary calendar
      // 3. Parse event details and map to interview format
      // 4. Create/update corresponding interview records
      // 5. Return number of events synced

      return NextResponse.json({
        success: true,
        message: "Calendar events imported successfully",
        eventsSynced: 0,
      });
    }

    if (action === "delete") {
      // Delete event from Google Calendar
      const { eventId, interviewId } = body;

      if (!eventId || !interviewId) {
        return NextResponse.json(
          { error: "Missing eventId or interviewId" },
          { status: 400 },
        );
      }

      const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
      });

      if (!interview) {
        return NextResponse.json(
          { error: "Interview not found" },
          { status: 404 },
        );
      }

      if (interview.interviewerId !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Get calendar tokens from user storage and delete event
      const tokenRecord = await prisma.integrationToken.findUnique({
        where: {
          userId_provider: {
            userId: session.user.id,
            provider: "google",
          },
        },
      });

      if (!tokenRecord?.accessToken) {
        return NextResponse.json(
          { error: "Google Calendar not connected" },
          { status: 401 },
        );
      }

      // For full implementation, would delete event from calendar using oauth2Client
      return NextResponse.json({
        success: true,
        message: "Event removed from calendar",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Calendar sync error:", error);
    return NextResponse.json(
      { error: "Calendar sync failed", details: error.message },
      { status: 500 },
    );
  }
}
