import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { captureApiError } from "@/lib/observability";
import prisma from "@/lib/prisma";

function safeParseContent(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

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

    // Prefer CVs explicitly linked to this application, falling back to latest user CV
    let cvs = await prisma.cV.findMany({
      where: {
        userId,
        ...(applicationId ? { applicationId } : {}),
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        content: true,
        applicationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (applicationId && cvs.length === 0) {
      cvs = await prisma.cV.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: {
          id: true,
          title: true,
          content: true,
          applicationId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    return NextResponse.json({
      cvs: cvs.map((cv) => ({
        id: cv.id,
        title: cv.title,
        content: safeParseContent(cv.content),
        applicationId: cv.applicationId,
        createdAt: cv.createdAt.toISOString(),
        updatedAt: cv.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    captureApiError("GET /api/cv/save", error, { userId });
    return NextResponse.json(
      { error: "Failed to load saved CVs" },
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

    const cvData = await request.json();
    const { title, content, fileUrl, applicationId } = cvData as {
      title?: string;
      content?: unknown;
      fileUrl?: string | null;
      applicationId?: string | null;
    };

    if (!content) {
      return NextResponse.json(
        { error: "CV content is required" },
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

    const serializedContent =
      typeof content === "string" ? content : JSON.stringify(content);

    const cv = await prisma.cV.create({
      data: {
        userId,
        applicationId: validApplicationId,
        title: title || "Untitled CV",
        content: serializedContent,
        fileUrl: fileUrl ?? null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        id: cv.id,
        applicationId: cv.applicationId,
        createdAt: cv.createdAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    captureApiError("POST /api/cv/save", error, { userId });
    return NextResponse.json({ error: "Failed to save CV" }, { status: 500 });
  }
}
