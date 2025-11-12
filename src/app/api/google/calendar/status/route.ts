import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isCalendarConnected } from "@/lib/google-calendar";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connected = await isCalendarConnected(session.user.id);

    return NextResponse.json({ connected });
  } catch (error) {
    console.error("Error checking calendar connection:", error);
    return NextResponse.json(
      { error: "Failed to check calendar connection" },
      { status: 500 }
    );
  }
}
