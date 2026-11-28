import { type NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const page = Math.min(
      1_000_000,
      Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1),
    );
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(searchParams.get("limit") ?? "15", 10) || 15),
    );
    const skip = (page - 1) * limit;
    const where: Prisma.InterviewWhereInput = {
      OR: [
        { interviewerId: session.user.id },
        { candidateId: session.user.id },
      ],
      videoRecordingUrl: { not: null },
    };
    const [total, interviews] = await Promise.all([
      prisma.interview.count({ where }),
      prisma.interview.findMany({
        where,
        select: {
          id: true,
          settings: true,
          duration: true,
          createdAt: true,
          recordingFileName: true,
          recordingSize: true,
          recordingObjectKey: true,
          interviewer: { select: { name: true } },
          candidate: { select: { name: true } },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json(
      {
        recordings: interviews.map((interview) => {
          let roomCode: string | undefined;
          try {
            const settings = JSON.parse(interview.settings ?? "{}");
            if (typeof settings?.roomCode === "string")
              roomCode = settings.roomCode;
          } catch {
            // Settings from older sessions may be absent or malformed.
          }
          const fileUrl = interview.recordingObjectKey
            ? `/api/recordings/${encodeURIComponent(interview.id)}`
            : "";
          return {
            id: interview.id,
            interviewId: interview.id,
            roomName: roomCode || `Interview ${interview.id.slice(0, 8)}`,
            fileName: interview.recordingFileName ?? "recording",
            fileUrl,
            fileSize: interview.recordingSize ?? 0,
            duration: (interview.duration ?? 0) * 60,
            createdAt: interview.createdAt.toISOString(),
            candidateName: interview.candidate?.name ?? "Unknown",
            interviewerName: interview.interviewer?.name ?? "Unknown",
            status: fileUrl ? "completed" : "migration-required",
          };
        }),
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
          hasMore: skip + limit < total,
        },
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("Failed to list recordings", error);
    return NextResponse.json(
      { error: "Failed to fetch recordings" },
      { status: 500 },
    );
  }
}
