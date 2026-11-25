import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { captureApiError } from "@/lib/observability";
import prisma from "@/lib/prisma";

const saveDesignSchema = z.object({
  id: z.string().optional().nullable(),
  title: z.string().trim().min(1).max(160),
  prompt: z.string().trim().min(1).max(2000),
  applicationId: z.string().optional().nullable(),
  nodes: z.array(z.unknown()).max(100),
  edges: z.array(z.unknown()).max(200),
  critique: z.unknown().optional().nullable(),
  score: z.number().int().min(0).max(100).optional().nullable(),
});

function safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function serializeDesignSession(s: {
  id: string;
  title: string;
  prompt: string;
  nodesJson: string;
  edgesJson: string;
  critiqueJson: string | null;
  applicationId: string | null;
  score: number | null;
  createdAt: Date;
  updatedAt: Date;
  application?: { id: string; company: string; role: string } | null;
}) {
  return {
    id: s.id,
    title: s.title,
    prompt: s.prompt,
    nodes: safeJsonParse<unknown[]>(s.nodesJson, []),
    edges: safeJsonParse<unknown[]>(s.edgesJson, []),
    critique: safeJsonParse<unknown | null>(s.critiqueJson, null),
    applicationId: s.applicationId,
    application: s.application ?? null,
    score: s.score,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  let userId: string | undefined;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = session.user.id;

    const applicationId = request.nextUrl.searchParams.get("applicationId");

    const sessions = await prisma.systemDesignSession.findMany({
      where: {
        userId,
        ...(applicationId ? { applicationId } : {}),
      },
      orderBy: { updatedAt: "desc" },
      take: 25,
      include: {
        application: {
          select: { id: true, company: true, role: true },
        },
      },
    });

    return NextResponse.json({
      sessions: sessions.map(serializeDesignSession),
    });
  } catch (error) {
    captureApiError("GET /api/system-design", error, { userId });
    return NextResponse.json(
      { error: "Failed to load system design sessions" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let userId: string | undefined;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = session.user.id;

    const body = await request.json();
    const parsed = saveDesignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid system design payload",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    let validApplicationId: string | null = null;
    if (parsed.data.applicationId) {
      const app = await prisma.jobApplication.findUnique({
        where: { id: parsed.data.applicationId },
        select: { id: true, userId: true },
      });
      if (app && app.userId === userId) {
        validApplicationId = app.id;
      }
    }

    const payload = {
      applicationId: validApplicationId,
      title: parsed.data.title,
      prompt: parsed.data.prompt,
      nodesJson: JSON.stringify(parsed.data.nodes),
      edgesJson: JSON.stringify(parsed.data.edges),
      critiqueJson: parsed.data.critique
        ? JSON.stringify(parsed.data.critique)
        : null,
      score: parsed.data.score ?? null,
    };

    let saved;
    if (parsed.data.id) {
      const existing = await prisma.systemDesignSession.findFirst({
        where: { id: parsed.data.id, userId },
        select: { id: true },
      });
      if (existing) {
        saved = await prisma.systemDesignSession.update({
          where: { id: existing.id },
          data: payload,
          include: {
            application: { select: { id: true, company: true, role: true } },
          },
        });
      }
    }

    if (!saved) {
      saved = await prisma.systemDesignSession.create({
        data: { userId, ...payload },
        include: {
          application: { select: { id: true, company: true, role: true } },
        },
      });
    }

    return NextResponse.json(
      { session: serializeDesignSession(saved) },
      { status: parsed.data.id ? 200 : 201 },
    );
  } catch (error) {
    captureApiError("POST /api/system-design", error, { userId });
    return NextResponse.json(
      { error: "Failed to save system design session" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  let userId: string | undefined;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = session.user.id;

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Missing session id" },
        { status: 400 },
      );
    }

    const existing = await prisma.systemDesignSession.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.systemDesignSession.delete({ where: { id: existing.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    captureApiError("DELETE /api/system-design", error, { userId });
    return NextResponse.json(
      { error: "Failed to delete system design session" },
      { status: 500 },
    );
  }
}
