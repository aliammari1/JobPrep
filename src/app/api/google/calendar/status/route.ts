import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { captureApiError } from "@/lib/observability";
import prisma from "@/lib/prisma";

export async function GET() {
  let userId: string | undefined;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ connected: false }, { status: 401 });
    }
    userId = session.user.id;

    const token = await prisma.integrationToken.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: "google",
        },
      },
      select: { id: true, expiresAt: true },
    });

    const connected = Boolean(
      token && (!token.expiresAt || token.expiresAt > new Date()),
    );

    return NextResponse.json({ connected });
  } catch (error) {
    captureApiError("GET /api/google/calendar/status", error, { userId });
    return NextResponse.json({ connected: false }, { status: 500 });
  }
}
