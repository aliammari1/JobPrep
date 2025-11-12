import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Webhook handler for LiveKit egress events
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, egress_info } = body;

    console.log("LiveKit webhook received:", event, egress_info);

    // Handle egress ended event (recording finished)
    if (event === "egress_ended" && egress_info) {
      const egressId = egress_info.egress_id;
      const status = egress_info.status;
      const fileInfo = egress_info.file;
      
      if (status === "EGRESS_COMPLETE" && fileInfo) {
        const recordingUrl = fileInfo.location || fileInfo.filename;
        
        // Find interview by egress ID stored in localStorage
        // Since we can't access localStorage here, you might want to store the mapping in the database
        // For now, we'll just log it
        console.log("Recording completed:", {
          egressId,
          recordingUrl,
          duration: fileInfo.duration,
          size: fileInfo.size,
        });

        // You can update the interview record here if you have a way to map egress ID to interview ID
        // Example:
        // await prisma.interview.updateMany({
        //   where: { settings: { contains: egressId } },
        //   data: { videoRecordingUrl: recordingUrl }
        // });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// GET handler for webhook verification
export async function GET(req: NextRequest) {
  return NextResponse.json({ status: "Webhook endpoint active" });
}
