/**
 * API route for tracking dismissed notifications
 * POST /api/notifications/dismiss - Track dismissed notifications
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Handle POST requests to record a dismissed notification.
 *
 * Validates the request body for a `notificationTag`, logs the dismissal, and returns
 * an appropriate JSON response indicating success or the validation/error reason.
 *
 * @returns A JSON HTTP response:
 * - 200: `{ success: true, message: "Dismissal tracked" }` on success.
 * - 400: `{ error: "Invalid notification tag" }` when `notificationTag` is missing.
 * - 500: `{ error: "Failed to track dismissal" }` on unexpected error.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, notificationTag } = body;

    if (!notificationTag) {
      return NextResponse.json(
        { error: "Invalid notification tag" },
        { status: 400 },
      );
    }

    // Log dismissal for analytics
    console.log(
      `[API] Notification dismissed: ${notificationTag} (ID: ${notificationId})`,
    );

    // In production, you would:
    // 1. Update user notification preferences
    // 2. Track engagement metrics
    // 3. Adjust notification frequency

    return NextResponse.json(
      {
        success: true,
        message: "Dismissal tracked",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[API] Error tracking dismissal:", error);
    return NextResponse.json(
      { error: "Failed to track dismissal" },
      { status: 500 },
    );
  }
}
