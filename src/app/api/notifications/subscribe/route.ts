/**
 * API route for handling push notification subscriptions
 * POST /api/notifications/subscribe - Subscribe user to push notifications
 */

import { NextRequest, NextResponse } from "next/server";

// In production, store subscriptions in a database
// This is a simple in-memory store for demonstration
const subscriptions = new Map<string, any>();

/**
 * Registers a push notification subscription from the request body and stores it in the in-memory subscriptions map.
 *
 * @param request - Incoming request whose JSON body must include a `subscription` object with an `endpoint` string; may include `userAgent`.
 * @returns A NextResponse containing `{ success: true, message, subscriptionId }` with status 201 on success, or `{ error }` with status 400 for invalid data or 500 for internal failure.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscription, userAgent } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: "Invalid subscription data" },
        { status: 400 }
      );
    }

    // Create a unique key for the subscription
    const subscriptionKey = subscription.endpoint;

    // Store subscription (in production, save to database)
    subscriptions.set(subscriptionKey, {
      subscription,
      userAgent,
      subscribedAt: new Date().toISOString(),
    });

    console.log(`[API] User subscribed to notifications: ${subscriptionKey}`);

    // In production, you would:
    // 1. Save to database with user association
    // 2. Send confirmation email
    // 3. Log for analytics

    return NextResponse.json(
      {
        success: true,
        message: "Successfully subscribed to notifications",
        subscriptionId: subscriptionKey,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Error handling subscription:", error);
    return NextResponse.json(
      { error: "Failed to subscribe to notifications" },
      { status: 500 }
    );
  }
}