import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: recordingId } = await params;

    // Find the interview
    const interview = await prisma.interview.findUnique({
      where: { id: recordingId },
    });

    if (!interview) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 },
      );
    }

    // Check if user has permission to delete
    if (
      interview.interviewerId !== session.user.id &&
      interview.candidateId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete file from Appwrite Storage if URL exists
    if (interview.videoRecordingUrl) {
      try {
        // Extract file ID from URL if needed
        const fileId = interview.settings
          ? JSON.parse(
              typeof interview.settings === "string"
                ? interview.settings
                : "{}",
            ).recordingFileId
          : recordingId;

        if (fileId) {
          const { deleteRecording } = await import("@/lib/appwrite");
          await deleteRecording(fileId);
        }
      } catch (storageError) {
        console.error(
          "Failed to delete from storage, but removing from database:",
          storageError,
        );
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Remove the URL from the database
    await prisma.interview.update({
      where: { id: recordingId },
      data: {
        videoRecordingUrl: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting recording:", error);
    return NextResponse.json(
      { error: "Failed to delete recording" },
      { status: 500 },
    );
  }
}
