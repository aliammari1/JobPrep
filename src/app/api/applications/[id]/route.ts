import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { captureApiError } from "@/lib/observability";
import prisma from "@/lib/prisma";

const STAGES = ["saved", "applied", "screening", "onsite", "offer"] as const;

const updateApplicationSchema = z.object({
  company: z.string().trim().min(1).max(120).optional(),
  role: z.string().trim().min(1).max(140).optional(),
  location: z.string().trim().max(120).nullable().optional(),
  jobUrl: z.string().trim().max(500).nullable().optional(),
  salaryRange: z.string().trim().max(100).nullable().optional(),
  stage: z.enum(STAGES).optional(),
  jobDescription: z.string().max(15000).optional(),
  atsScore: z.number().int().min(0).max(100).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
});

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  let userId: string | undefined;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = session.user.id;
    const { id } = await context.params;

    const app = await prisma.jobApplication.findUnique({
      where: { id },
      include: {
        cvs: {
          orderBy: { updatedAt: "desc" },
          take: 5,
          select: { id: true, title: true, updatedAt: true },
        },
        coverLetters: {
          orderBy: { updatedAt: "desc" },
          take: 5,
          select: { id: true, title: true, updatedAt: true },
        },
        mockSessions: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            sessionType: true,
            overallScore: true,
            duration: true,
            createdAt: true,
          },
        },
        interviews: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            status: true,
            overallScore: true,
            scheduledAt: true,
            createdAt: true,
          },
        },
        systemDesignSessions: {
          orderBy: { updatedAt: "desc" },
          take: 5,
          select: {
            id: true,
            title: true,
            score: true,
            updatedAt: true,
          },
        },
        codeSubmissions: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            title: true,
            language: true,
            status: true,
            testsPassed: true,
            totalTests: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            cvs: true,
            coverLetters: true,
            mockSessions: true,
            interviews: true,
            systemDesignSessions: true,
            codeSubmissions: true,
          },
        },
      },
    });

    if (!app) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (app.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      application: {
        id: app.id,
        company: app.company,
        role: app.role,
        location: app.location ?? "",
        jobUrl: app.jobUrl ?? "",
        salaryRange: app.salaryRange ?? "",
        stage: app.stage,
        jobDescription: app.jobDescription,
        atsScore: app.atsScore,
        notes: app.notes ?? "",
        counts: app._count,
        artifacts: {
          cvs: app.cvs.map((item) => ({
            ...item,
            updatedAt: item.updatedAt.toISOString(),
          })),
          coverLetters: app.coverLetters.map((item) => ({
            ...item,
            updatedAt: item.updatedAt.toISOString(),
          })),
          mockSessions: app.mockSessions.map((item) => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
          })),
          interviews: app.interviews.map((item) => ({
            ...item,
            scheduledAt: item.scheduledAt?.toISOString() ?? null,
            createdAt: item.createdAt.toISOString(),
          })),
          systemDesignSessions: app.systemDesignSessions.map((item) => ({
            ...item,
            updatedAt: item.updatedAt.toISOString(),
          })),
          codeSubmissions: app.codeSubmissions.map((item) => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
          })),
        },
        createdAt: app.createdAt.toISOString(),
        updatedAt: app.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    captureApiError("GET /api/applications/[id]", error, { userId });
    return NextResponse.json(
      { error: "Failed to load application" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  let userId: string | undefined;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = session.user.id;
    const { id } = await context.params;

    const existing = await prisma.jobApplication.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (existing.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateApplicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid update payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const updated = await prisma.jobApplication.update({
      where: { id },
      data: parsed.data,
      include: {
        _count: {
          select: {
            cvs: true,
            coverLetters: true,
            mockSessions: true,
            interviews: true,
            systemDesignSessions: true,
            codeSubmissions: true,
          },
        },
      },
    });

    return NextResponse.json({
      application: {
        id: updated.id,
        company: updated.company,
        role: updated.role,
        location: updated.location ?? "",
        jobUrl: updated.jobUrl ?? "",
        salaryRange: updated.salaryRange ?? "",
        stage: updated.stage,
        jobDescription: updated.jobDescription,
        atsScore: updated.atsScore,
        notes: updated.notes ?? "",
        counts: updated._count,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    captureApiError("PATCH /api/applications/[id]", error, { userId });
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  let userId: string | undefined;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = session.user.id;
    const { id } = await context.params;

    const existing = await prisma.jobApplication.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (existing.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.jobApplication.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    captureApiError("DELETE /api/applications/[id]", error, { userId });
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 },
    );
  }
}
