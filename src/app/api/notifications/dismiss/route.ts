/**
 * API route for tracking dismissed notifications
 * POST /api/notifications/dismiss - Track dismissed notifications
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, notificationTag } = body;

    if (!notificationTag) {
      return NextResponse.json(
        { error: "Invalid notification tag" },
        { status: 400 }
      );
    }

    // Log dismissal for analytics
    console.log(
      `[API] Notification dismissed: ${notificationTag} (ID: ${notificationId})`
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
      { status: 200 }
    );
  } catch (error) {
    console.error("[API] Error tracking dismissal:", error);
    return NextResponse.json(
      { error: "Failed to track dismissal" },
      { status: 500 }
    );
  }
}
