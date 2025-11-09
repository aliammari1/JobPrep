import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch interviews for the current user
    // Include all completed interviews, even those without cloud recording URLs
    const interviews = await prisma.interview.findMany({
      where: {
        OR: [
          { interviewerId: session.user.id },
          { candidateId: session.user.id },
        ],
        videoRecordingUrl: {
          not: null,
        },
        // status: {
        //   in: ["completed", "in-progress"],
        // },
      },
      include: {
        interviewer: {
          select: {
            name: true,
            email: true,
          },
        },
        candidate: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`Found ${interviews.length} interviews for user ${session.user.id}:`, 
      interviews.map(i => ({ 
        id: i.id.slice(0, 8), 
        status: i.status, 
        hasUrl: !!i.videoRecordingUrl,
        createdAt: i.createdAt,
      }))
    );

    // Transform to recording format
    const recordings = interviews.map((interview) => {
      // Parse settings to get roomCode and recording metadata
      let roomCode = "";
      let recordingFileSize = 0;
      let recordingFileId = "";
      
      try {
        if (interview.settings) {
          const settings = typeof interview.settings === 'string'
            ? JSON.parse(interview.settings)
            : interview.settings;
          roomCode = settings.roomCode || "";
          recordingFileSize = settings.recordingFileSize || 0;
          recordingFileId = settings.recordingFileId || "";
        }
      } catch (e) {
        console.error("Error parsing settings:", e);
      }

      const recording = {
        id: interview.id,
        interviewId: interview.id,
        roomName: roomCode || `Interview ${interview.id.slice(0, 8)}`,
        fileName: recordingFileId ? `recording-${interview.id}.webm` : "",
        fileUrl: interview.videoRecordingUrl || "",
        fileSize: recordingFileSize,
        duration: interview.duration ? interview.duration * 60 : 0, // Convert minutes to seconds
        createdAt: interview.createdAt.toISOString(),
        candidateName: interview.candidate?.name || "Unknown",
        interviewerName: interview.interviewer?.name || "Unknown",
        status: interview.videoRecordingUrl 
          ? "completed" 
          : interview.status === "completed" 
            ? "no-recording" 
            : "in-progress",
      };

      // Debug log for interviews with recording URLs
      if (interview.videoRecordingUrl) {
        console.log("Recording found:", {
          id: recording.id,
          roomName: recording.roomName,
          hasUrl: !!recording.fileUrl,
          status: recording.status,
        });
      }

      return recording;
    });

    console.log(`Returning ${recordings.length} recordings, ${recordings.filter(r => r.fileUrl).length} with URLs`);

    return NextResponse.json({ recordings });
  } catch (error) {
    console.error("Error fetching recordings:", error);
    return NextResponse.json(
      { error: "Failed to fetch recordings" },
      { status: 500 }
    );
  }
}
