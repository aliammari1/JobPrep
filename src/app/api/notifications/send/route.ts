/**
 * API route for sending push notifications
 * POST /api/notifications/send - Send push notification (admin/server use)
 */

import { NextRequest, NextResponse } from "next/server";

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
  data?: Record<string, any>;
  targetUserId?: string;
  broadcastToAll?: boolean;
}

/**
 * Handles POST requests to send a push notification based on the request JSON.
 *
 * @param request - Incoming NextRequest whose JSON body must match SendNotificationRequest (requires `title` and `body`; optional `icon`, `badge`, `tag`, `actions`, `data`, `targetUserId`, `broadcastToAll`).
 * @returns A NextResponse with JSON: on success `{ success: true, message: "Notification sent successfully", notification: { title, body, icon, badge, tag, actions, data } }`; on failure `{ error: string }`.
 */
export async function POST(request: NextRequest) {
  try {
    const body: SendNotificationRequest = await request.json();

    // Validate required fields
    if (!body.title || !body.body) {
      return NextResponse.json(
        { error: "Title and body are required" },
        { status: 400 }
      );
    }

    // In production, you would:
    // 1. Authenticate the request (check API key, user role)
    // 2. Fetch user subscriptions from database
    // 3. Send using Web Push Protocol (web-push library)
    // 4. Track delivery and failures

    const notificationPayload = {
      title: body.title,
      body: body.body,
      icon: body.icon || "/icons/icon-192x192.png",
      badge: body.badge || "/icons/badge-72x72.png",
      tag: body.tag || "notification",
      actions: body.actions || [],
      data: body.data || {},
    };

    console.log("[API] Sending notification:", notificationPayload);

    // Example: Send to specific user or broadcast
    if (body.targetUserId) {
      console.log(`[API] Sending to user: ${body.targetUserId}`);
      // await sendToUser(body.targetUserId, notificationPayload);
    } else if (body.broadcastToAll) {
      console.log("[API] Broadcasting to all subscribed users");
      // await broadcastToAll(notificationPayload);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Notification sent successfully",
        notification: notificationPayload,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API] Error sending notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}

/**
 * Send a push notification payload to all saved subscriptions for a specific user.
 *
 * Intended to deliver the given notification payload to each of the user's stored push subscriptions.
 * Currently a placeholder: example sending logic is commented out and must be implemented (e.g., using a Web Push library).
 *
 * @param payload - The notification payload to deliver (typically contains title, body, icon, tag, data, etc.)
 */
async function sendToUser(userId: string, payload: any): Promise<void> {
  // const subscriptions = await db.notification.findMany({
  //   where: { userId },
  //   select: { subscription: true }
  // });

  // for (const { subscription } of subscriptions) {
  //   try {
  //     await webpush.sendNotification(subscription, JSON.stringify(payload));
  //   } catch (error) {
  //     console.error(`Failed to send notification to ${userId}:`, error);
  //   }
  // }
}

/**
 * Broadcast a notification payload to all subscribed users.
 *
 * Placeholder implementation that does not send notifications; intended to iterate stored push
 * subscriptions and deliver `payload` to each subscriber in production.
 *
 * @param payload - The notification payload to deliver to subscribers
 */
async function broadcastToAll(payload: any): Promise<void> {
  // const subscriptions = await db.notification.findMany({
  //   select: { subscription: true }
  // });

  // for (const { subscription } of subscriptions) {
  //   try {
  //     await webpush.sendNotification(subscription, JSON.stringify(payload));
  //   } catch (error) {
  //     console.error("Failed to broadcast notification:", error);
  //   }
  // }
}