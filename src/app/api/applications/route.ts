import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { captureApiError } from "@/lib/observability";
import prisma from "@/lib/prisma";

const STAGES = ["saved", "applied", "screening", "onsite", "offer"] as const;

const createApplicationSchema = z.object({
  company: z.string().trim().min(1, "Company is required").max(120),
  role: z.string().trim().min(1, "Role is required").max(140),
  location: z.string().trim().max(120).optional().default(""),
  jobUrl: z.string().trim().max(500).optional().default(""),
  salaryRange: z.string().trim().max(100).optional().default(""),
  stage: z.enum(STAGES).optional().default("saved"),
  jobDescription: z.string().max(15000).optional().default(""),
  atsScore: z.number().int().min(0).max(100).nullable().optional(),
  notes: z.string().max(5000).optional(),
});

const APPLICATION_COUNT_INCLUDE = {
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
} as const;

function serializeApplication(app: {
  id: string;
  company: string;
  role: string;
  location: string | null;
  jobUrl: string | null;
  salaryRange: string | null;
  stage: string;
  jobDescription: string;
  atsScore: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    cvs: number;
    coverLetters: number;
    mockSessions: number;
    interviews: number;
    systemDesignSessions: number;
    codeSubmissions: number;
  };
}) {
  return {
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
    counts: {
      cvs: app._count?.cvs ?? 0,
      coverLetters: app._count?.coverLetters ?? 0,
      mockSessions: app._count?.mockSessions ?? 0,
      interviews: app._count?.interviews ?? 0,
      systemDesignSessions: app._count?.systemDesignSessions ?? 0,
      codeSubmissions: app._count?.codeSubmissions ?? 0,
    },
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
  };
}

export async function GET() {
  let userId: string | undefined;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = session.user.id;

    const applications = await prisma.jobApplication.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: APPLICATION_COUNT_INCLUDE,
    });

    return NextResponse.json({
      applications: applications.map(serializeApplication),
    });
  } catch (error) {
    captureApiError("GET /api/applications", error, { userId });
    return NextResponse.json(
      { error: "Failed to load applications" },
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
    const parsed = createApplicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid application payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const created = await prisma.jobApplication.create({
      data: {
        userId,
        company: parsed.data.company,
        role: parsed.data.role,
        location: parsed.data.location || null,
        jobUrl: parsed.data.jobUrl || null,
        salaryRange: parsed.data.salaryRange || null,
        stage: parsed.data.stage,
        jobDescription: parsed.data.jobDescription,
        atsScore: parsed.data.atsScore ?? null,
        notes: parsed.data.notes ?? null,
      },
      include: APPLICATION_COUNT_INCLUDE,
    });

    return NextResponse.json(
      { application: serializeApplication(created) },
      { status: 201 },
    );
  } catch (error) {
    captureApiError("POST /api/applications", error, { userId });
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 },
    );
  }
}
