import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

async function generateToken(roomName: string, participantName: string) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    throw new Error("Server misconfigured - LiveKit credentials not found");
  }

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
    const roomName = req.nextUrl.searchParams.get("roomName");
    const participantName = req.nextUrl.searchParams.get("participantName");

    if (!roomName) {
      return NextResponse.json(
        { error: "Missing roomName parameter" },
        { status: 400 }
      );
    }

    if (!participantName) {
      return NextResponse.json(
        { error: "Missing participantName parameter" },
        { status: 400 }
      );
    }

    const token = await generateToken(roomName, participantName);
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error generating LiveKit token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomName, participantName } = body;

    if (!roomName) {
      return NextResponse.json(
        { error: "Missing roomName parameter" },
        { status: 400 }
      );
    }

    if (!participantName) {
      return NextResponse.json(
        { error: "Missing participantName parameter" },
        { status: 400 }
      );
    }

    const token = await generateToken(roomName, participantName);
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error generating LiveKit token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
