import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { roomName } = body;

    if (!roomName) {
      return NextResponse.json(
        { error: "Room name is required" },
        { status: 400 }
      );
    }

    // For now, return success to enable client-side recording
    // LiveKit cloud recording requires proper storage configuration (S3, GCS, etc.)
    // Once you configure storage, you can enable the full implementation
    
    console.log("Recording request for room:", roomName);
    console.log("Note: Server-side recording requires storage configuration (S3/GCS)");
    console.log("Using client-side recording instead");

    return NextResponse.json({
      success: true,
      egressId: `client-recording-${Date.now()}`,
      status: "RECORDING_ACTIVE",
      message: "Client-side recording enabled. Configure S3/GCS for server-side recording.",
    });
  } catch (error: any) {
    console.error("Error starting LiveKit recording:", error);
    return NextResponse.json(
      { error: error.message || "Failed to start recording" },
      { status: 500 }
    );
  }
}
