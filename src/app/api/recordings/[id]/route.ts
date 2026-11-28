import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cloudflareContext } from "@/lib/cloudflare";
import prisma from "@/lib/prisma";

type Route = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Route) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const interview = await prisma.interview.findFirst({
      where: {
        id,
        OR: [
          { candidateId: session.user.id },
          { interviewerId: session.user.id },
        ],
      },
      select: {
        recordingObjectKey: true,
        recordingFileName: true,
        recordingContentType: true,
        videoRecordingUrl: true,
      },
    });
    if (!interview?.videoRecordingUrl) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 },
      );
    }
    if (!interview.recordingObjectKey) {
      return NextResponse.json(
        { error: "Recording is awaiting storage migration" },
        { status: 409 },
      );
    }

    const bucket = cloudflareContext()?.env.RECORDINGS_BUCKET;
    if (!bucket) {
      return NextResponse.json(
        { error: "Recording storage is unavailable" },
        { status: 503 },
      );
    }
    const metadata = await bucket.head(interview.recordingObjectKey);
    if (!metadata) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 },
      );
    }

    const headers = new Headers({
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, no-store",
      "Content-Type":
        interview.recordingContentType ?? "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      ETag: metadata.httpEtag,
    });
    if (request.nextUrl.searchParams.has("download")) {
      const name =
        interview.recordingFileName?.replace(/[^a-z0-9._-]/gi, "_") ??
        "recording";
      headers.set("Content-Disposition", `attachment; filename="${name}"`);
    }

    let range: { offset: number; length: number } | undefined;
    const rangeHeader = request.headers.get("range");
    const ifRange = request.headers.get("if-range");
    if (rangeHeader && (!ifRange || ifRange === metadata.httpEtag)) {
      const match = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader);
      const start = match?.[1] ?? "";
      const end = match?.[2] ?? "";
      const offset = start
        ? Number(start)
        : Math.max(0, metadata.size - Number(end));
      const last =
        start && end
          ? Math.min(Number(end), metadata.size - 1)
          : metadata.size - 1;
      if (
        !match ||
        (!start && (!end || Number(end) <= 0)) ||
        !Number.isSafeInteger(offset) ||
        !Number.isSafeInteger(last) ||
        offset >= metadata.size ||
        last < offset
      ) {
        headers.set("Content-Range", `bytes */${metadata.size}`);
        return new Response(null, { status: 416, headers });
      }
      range = { offset, length: last - offset + 1 };
      headers.set("Content-Range", `bytes ${offset}-${last}/${metadata.size}`);
    }
    headers.set("Content-Length", String(range?.length ?? metadata.size));

    const status = range ? 206 : 200;
    if (request.method === "HEAD")
      return new Response(null, { status, headers });

    const object = await bucket.get(
      interview.recordingObjectKey,
      range ? { range } : undefined,
    );
    if (!object) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 },
      );
    }

    return new Response(object.body, { status, headers });
  } catch (error) {
    console.error("Recording playback failed", error);
    return NextResponse.json(
      { error: "Failed to load recording" },
      { status: 500 },
    );
  }
}

export const HEAD = GET;

export async function DELETE(request: NextRequest, { params }: Route) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const participants = [
      { candidateId: session.user.id },
      { interviewerId: session.user.id },
    ];
    const interview = await prisma.interview.findFirst({
      where: { id, OR: participants },
      select: { recordingObjectKey: true, videoRecordingUrl: true },
    });
    if (!interview) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 },
      );
    }
    const key = interview.recordingObjectKey;
    if (!key) {
      if (interview.videoRecordingUrl) {
        return NextResponse.json(
          { error: "Recording is awaiting storage migration" },
          { status: 409 },
        );
      }
      return NextResponse.json({ success: true });
    }

    // The database trigger enqueues this exact object in the same transaction.
    const detached = await prisma.interview.updateMany({
      where: { id, OR: participants, recordingObjectKey: key },
      data: {
        videoRecordingUrl: null,
        recordingObjectKey: null,
        recordingFileName: null,
        recordingContentType: null,
        recordingSize: null,
      },
    });
    if (!detached.count) {
      return NextResponse.json(
        { error: "Recording changed during deletion" },
        { status: 409 },
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Recording deletion failed", error);
    return NextResponse.json(
      { error: "Failed to delete recording" },
      { status: 500 },
    );
  }
}
