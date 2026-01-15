import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ connected: false, profile: null });
    }

    // Check if LinkedIn tokens exist in database
    const prisma = (await import("@/lib/prisma")).default;
    const token = await prisma.integrationToken.findUnique({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider: "linkedin",
        },
      },
    });

    const isConnected =
      !!token && (!token.expiresAt || token.expiresAt > new Date());
    const connected = isConnected;

    return NextResponse.json({ connected, profile: null });
  } catch (error) {
    return NextResponse.json({ connected: false, profile: null });
  }
}
