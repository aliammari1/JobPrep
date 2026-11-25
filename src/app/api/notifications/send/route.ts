/**
 * API route for sending push notifications
 * POST /api/notifications/send - Send push notification (admin/server use)
 *
 * Current state: the Web Push sender is not implemented (no `web-push`
 * dependency, no subscription storage model). This handler authenticates,
 * validates input, and returns 501 until a real sender is wired. It never
 * claims a notification was sent.
 */

import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

interface SendNotificationRequest {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  actions?: Array<{
    action: string;
    title: string;
  }>;
  data?: Record<string, unknown>;
  targetUserId?: string;
  broadcastToAll?: boolean;
}

/**
 * Validate a send-notification request.
 *
 * Authenticates the caller (admin only), validates `title`/`body`, and
 * reports that server-side delivery is not implemented yet instead of
 * returning a false success.
 *
 * @param request - Incoming NextRequest whose JSON body must match SendNotificationRequest.
 * @returns 401 when unauthenticated, 403 when not an admin, 400 for invalid
 * input, 501 when delivery is requested but no sender is configured.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body: SendNotificationRequest = await request.json();

    // Validate required fields
    if (
      !body.title ||
      typeof body.title !== "string" ||
      !body.body ||
      typeof body.body !== "string"
    ) {
      return NextResponse.json(
        { error: "Title and body are required" },
        { status: 400 },
      );
    }

    if (body.title.length > 120 || body.body.length > 500) {
      return NextResponse.json(
        { error: "Title (max 120) or body (max 500) too long" },
        { status: 400 },
      );
    }

    // No delivery backend is configured in this deployment: there is no
    // `web-push` dependency and no persistent subscription store (subscribe
    // uses an ephemeral in-memory Map). Returning success here would lie to
    // operators, so fail explicitly.
    // To implement: add `web-push`, configure VAPID keys, persist
    // subscriptions (e.g. a PushSubscription model keyed by endpoint +
    // userId), then deliver via webpush.sendNotification().
    return NextResponse.json(
      {
        error: "Push delivery is not implemented",
        details:
          "No Web Push sender or subscription store is configured. Notification was validated but not sent.",
      },
      { status: 501 },
    );
  } catch (error) {
    console.error("[API] Error sending notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 },
    );
  }
}
