import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { uploadRecording } from "@/lib/appwrite";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const interviewId = formData.get("interviewId") as string;
    const roomName = formData.get("roomName") as string;

    console.log("Upload request received:", {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      interviewId,
      roomName,
    });

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!interviewId) {
      return NextResponse.json(
        { error: "Interview ID is required" },
        { status: 400 },
      );
    }

    // Check if user has permission
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
    });

    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 },
      );
    }

    if (
      interview.candidateId !== session.user.id &&
      interview.interviewerId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Convert File to Buffer for Appwrite
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("Converted to buffer:", {
      bufferSize: buffer.length,
      fileExtension: file.name.split(".").pop(),
    });

    // Generate a meaningful filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `recording-${roomName || interviewId}-${timestamp}.${file.name.split(".").pop()}`;

    console.log("Uploading to Appwrite with filename:", fileName);

    // Upload to Appwrite with user-specific permissions
    const uploadResult = await uploadRecording(buffer, fileName, [
      `read("user:${session.user.id}")`,
      `write("user:${session.user.id}")`,
      `delete("user:${session.user.id}")`,
    ]);

    console.log("Upload successful:", {
      fileId: uploadResult.fileId,
      fileSize: uploadResult.fileSize,
      fileUrl: uploadResult.fileUrl,
    });

    // Parse existing settings
    let existingSettings: any = {};
    try {
      if (interview.settings) {
        existingSettings =
          typeof interview.settings === "string"
            ? JSON.parse(interview.settings)
            : interview.settings;
      }
    } catch (e) {
      console.error("Error parsing existing settings:", e);
    }

    const updatedSettings = {
      ...existingSettings,
      recordingFileId: uploadResult.fileId,
      recordingFileName: uploadResult.fileName,
      recordingFileSize: uploadResult.fileSize,
      recordingMimeType: uploadResult.mimeType,
      roomCode: roomName || existingSettings.roomCode,
    };

    console.log("Updating interview with:", {
      interviewId,
      videoRecordingUrl: uploadResult.fileUrl,
      settings: updatedSettings,
    });

    // Update interview with recording URL and metadata
    const updatedInterview = await prisma.interview.update({
      where: { id: interviewId },
      data: {
        videoRecordingUrl: uploadResult.fileUrl,
        settings: JSON.stringify(updatedSettings),
      },
    });

    console.log("Interview updated successfully:", {
      id: updatedInterview.id,
      videoRecordingUrl: updatedInterview.videoRecordingUrl,
      hasSettings: !!updatedInterview.settings,
    });

    return NextResponse.json({
      success: true,
      recording: uploadResult,
      message: "Recording uploaded successfully",
    });
  } catch (error: any) {
    console.error("Error uploading recording:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload recording" },
      { status: 500 },
    );
  }
}
