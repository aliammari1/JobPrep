import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if subscription exists
    const existingSubscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id },
    });

    if (!existingSubscription) {
      return NextResponse.json(
        { message: "No active subscription found" },
        { status: 404 }
      );
    }

    // Downgrade to FREE plan
    const subscription = await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        tier: "FREE",
        status: "ACTIVE",
        cancelAtPeriodEnd: false,
      },
    });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Downgrade subscription error:", error);
    return NextResponse.json(
      { message: "Failed to downgrade subscription" },
      { status: 500 }
    );
  }
}
