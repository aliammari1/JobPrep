/**
 * API route for handling push notification unsubscriptions
 * POST /api/notifications/unsubscribe - Unsubscribe user from push notifications
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Handles POST requests to unsubscribe a push notification endpoint.
 *
 * @param request - Incoming request whose JSON body must include an `endpoint` string to remove from subscriptions
 * @returns A JSON response: `200` with `{ success: true, message: "Successfully unsubscribed from notifications" }` on success;
 * `400` with `{ error: "Invalid endpoint" }` if `endpoint` is missing; `500` with `{ error: "Failed to unsubscribe from notifications" }` on internal error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: "Invalid endpoint" },
        { status: 400 }
      );
    }

    // Remove subscription from store
    // In production, delete from database
    console.log(`[API] User unsubscribed from notifications: ${endpoint}`);

    // In production, you would:
    // 1. Delete from database
    // 2. Send confirmation email
    // 3. Log for analytics

    return NextResponse.json(
      {
        success: true,
        message: "Successfully unsubscribed from notifications",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API] Error handling unsubscription:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe from notifications" },
      { status: 500 }
    );
  }
}