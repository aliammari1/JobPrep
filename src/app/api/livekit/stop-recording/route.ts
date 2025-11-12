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
    const { egressId } = body;

    if (!egressId) {
      return NextResponse.json(
        { error: "Egress ID is required" },
        { status: 400 }
      );
    }

    console.log("Stopping recording:", egressId);
    console.log("Note: Server-side recording requires storage configuration (S3/GCS)");
    console.log("Using client-side recording instead");

    // For client-side recording, we just acknowledge the stop
    return NextResponse.json({
      success: true,
      egressId,
      status: "RECORDING_COMPLETE",
      message: "Client-side recording stopped. Configure S3/GCS for server-side recording with URLs.",
      recordingUrl: null, // No URL available for client-side recording
    });
  } catch (error: any) {
    console.error("Error stopping LiveKit recording:", error);
    return NextResponse.json(
      { error: error.message || "Failed to stop recording" },
      { status: 500 }
    );
  }
}
