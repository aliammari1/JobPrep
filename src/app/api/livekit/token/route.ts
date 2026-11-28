import { AccessToken } from "livekit-server-sdk";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

function isLiveKitConfigured() {
  return Boolean(
    process.env.LIVEKIT_API_KEY &&
      process.env.LIVEKIT_API_SECRET &&
      (process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL),
  );
}

async function generateToken(roomName: string, participantName: string) {
  const apiKey = process.env.LIVEKIT_API_KEY!;
  const apiSecret = process.env.LIVEKIT_API_SECRET!;

  // Create access token
  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
    // Token expires in 24 hours
    ttl: "24h",
  });

  // Grant permissions to join the room
  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  const token = await at.toJwt();
  return token;
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = await rateLimit(req, "livekit");
    if (!limit.success) return rateLimitResponse(limit);

    if (!isLiveKitConfigured()) {
      return NextResponse.json(
        { error: "Video conferencing service is not configured" },
        { status: 503 },
      );
    }

    const roomName = req.nextUrl.searchParams.get("roomName");
    const participantName = req.nextUrl.searchParams.get("participantName");

    if (!roomName) {
      return NextResponse.json(
        { error: "Missing roomName parameter" },
        { status: 400 },
      );
    }

    if (!participantName) {
      return NextResponse.json(
        { error: "Missing participantName parameter" },
        { status: 400 },
      );
    }

    const token = await generateToken(roomName, participantName);
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error generating LiveKit token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = await rateLimit(req, "livekit");
    if (!limit.success) return rateLimitResponse(limit);

    if (!isLiveKitConfigured()) {
      return NextResponse.json(
        { error: "Video conferencing service is not configured" },
        { status: 503 },
      );
    }

    const body = await req.json();
    const { roomName, participantName } = body;

    if (!roomName) {
      return NextResponse.json(
        { error: "Missing roomName parameter" },
        { status: 400 },
      );
    }

    if (!participantName) {
      return NextResponse.json(
        { error: "Missing participantName parameter" },
        { status: 400 },
      );
    }

    const token = await generateToken(roomName, participantName);
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error generating LiveKit token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 },
    );
  }
}
