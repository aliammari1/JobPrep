import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { captureApiError } from "@/lib/observability";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  let userId: string | undefined;
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = session.user.id;

    const applicationId = request.nextUrl.searchParams.get("applicationId");
    const letters = await prisma.coverLetter.findMany({
      where: {
        userId,
        ...(applicationId ? { applicationId } : {}),
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        content: true,
        jobTitle: true,
        company: true,
        applicationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      coverLetters: letters.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    captureApiError("GET /api/cover-letter/save", error, { userId });
    return NextResponse.json(
      { error: "Failed to load cover letters" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  let userId: string | undefined;
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = session.user.id;

    const letterData = await request.json();
    const { title, content, jobTitle, company, applicationId } = letterData as {
      title?: string;
      content?: string;
      jobTitle?: string;
      company?: string;
      applicationId?: string | null;
    };

    if (!content) {
      return NextResponse.json(
        { error: "Cover letter content is required" },
        { status: 400 },
      );
    }

    let validApplicationId: string | null = null;
    if (typeof applicationId === "string" && applicationId.trim()) {
      const app = await prisma.jobApplication.findFirst({
        where: { id: applicationId, userId },
        select: { id: true },
      });
      validApplicationId = app?.id ?? null;
    }

    const coverLetter = await prisma.coverLetter.create({
      data: {
        userId,
        applicationId: validApplicationId,
        title: title || "Untitled Cover Letter",
        content,
        jobTitle,
        company,
      },
    });

    return NextResponse.json(
      {
        success: true,
        id: coverLetter.id,
        applicationId: coverLetter.applicationId,
        createdAt: coverLetter.createdAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    captureApiError("POST /api/cover-letter/save", error, { userId });
    return NextResponse.json(
      { error: "Failed to save cover letter" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  let userId: string | undefined;
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = session.user.id;

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Missing cover letter id" },
        { status: 400 },
      );
    }

    const existing = await prisma.coverLetter.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.coverLetter.delete({ where: { id: existing.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    captureApiError("DELETE /api/cover-letter/save", error, { userId });
    return NextResponse.json(
      { error: "Failed to delete cover letter" },
      { status: 500 },
    );
  }
}
