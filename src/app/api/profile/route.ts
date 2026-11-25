import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { captureApiError } from "@/lib/observability";
import prisma from "@/lib/prisma";

const updateProfileSchema = z.object({
  jobTitle: z.string().trim().max(140).optional().nullable(),
  location: z.string().trim().max(140).optional().nullable(),
  expectedSalary: z.string().trim().max(100).optional().nullable(),
  linkedIn: z.string().trim().max(300).optional().nullable(),
  github: z.string().trim().max(300).optional().nullable(),
  portfolio: z.string().trim().max(300).optional().nullable(),
  remote: z.boolean().optional(),
  skills: z.array(z.string().trim().min(1).max(60)).max(40).optional(),
  careerGoals: z.string().trim().max(2000).optional().nullable(),
});

export async function GET() {
  let userId: string | undefined;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = session.user.id;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    return NextResponse.json({
      profile: profile
        ? {
            jobTitle: profile.jobTitle ?? "",
            location: profile.location ?? "",
            expectedSalary: profile.expectedSalary ?? "",
            linkedIn: profile.linkedIn ?? "",
            github: profile.github ?? "",
            portfolio: profile.portfolio ?? "",
            remote: profile.remote,
            skills: profile.skills,
            careerGoals: profile.careerGoals ?? "",
            updatedAt: profile.updatedAt.toISOString(),
          }
        : null,
    });
  } catch (error) {
    captureApiError("GET /api/profile", error, { userId });
    return NextResponse.json(
      { error: "Failed to load candidate profile" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  let userId: string | undefined;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = session.user.id;

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid profile data", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const d = parsed.data;
    const saved = await prisma.candidateProfile.upsert({
      where: { userId },
      create: {
        userId,
        jobTitle: d.jobTitle || null,
        location: d.location || null,
        expectedSalary: d.expectedSalary || null,
        linkedIn: d.linkedIn || null,
        github: d.github || null,
        portfolio: d.portfolio || null,
        remote: d.remote ?? true,
        skills: d.skills ?? [],
        careerGoals: d.careerGoals || null,
      },
      update: {
        ...(d.jobTitle !== undefined ? { jobTitle: d.jobTitle || null } : {}),
        ...(d.location !== undefined ? { location: d.location || null } : {}),
        ...(d.expectedSalary !== undefined
          ? { expectedSalary: d.expectedSalary || null }
          : {}),
        ...(d.linkedIn !== undefined ? { linkedIn: d.linkedIn || null } : {}),
        ...(d.github !== undefined ? { github: d.github || null } : {}),
        ...(d.portfolio !== undefined
          ? { portfolio: d.portfolio || null }
          : {}),
        ...(d.remote !== undefined ? { remote: d.remote } : {}),
        ...(d.skills !== undefined ? { skills: d.skills } : {}),
        ...(d.careerGoals !== undefined
          ? { careerGoals: d.careerGoals || null }
          : {}),
      },
    });

    return NextResponse.json({
      profile: {
        jobTitle: saved.jobTitle ?? "",
        location: saved.location ?? "",
        expectedSalary: saved.expectedSalary ?? "",
        linkedIn: saved.linkedIn ?? "",
        github: saved.github ?? "",
        portfolio: saved.portfolio ?? "",
        remote: saved.remote,
        skills: saved.skills,
        careerGoals: saved.careerGoals ?? "",
        updatedAt: saved.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    captureApiError("PATCH /api/profile", error, { userId });
    return NextResponse.json(
      { error: "Failed to save candidate profile" },
      { status: 500 },
    );
  }
}
