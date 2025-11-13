import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

interface SaveCodeRequest {
  code: string;
  language: string;
  challengeId: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code, language, challengeId }: SaveCodeRequest = await request.json();

    if (!code || !language || !challengeId) {
      return NextResponse.json(
        { error: "Missing required fields: code, language, challengeId" },
        { status: 400 }
      );
    }

    // Validate code length (prevent abuse)
    if (code.length > 50000) {
      return NextResponse.json(
        { error: "Code exceeds maximum length of 50KB" },
        { status: 413 }
      );
    }

    // Save draft code to database
    const draft = await prisma.codeDraft.upsert({
      where: {
        userId_challengeId: {
          userId: session.user.id,
          challengeId,
        },
      },
      update: {
        code,
        language,
        lastSavedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        challengeId,
        code,
        language,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Code saved successfully",
        draftId: draft.id,
        savedAt: draft.lastSavedAt.toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving code draft:", error);
    return NextResponse.json(
      {
        error: "Failed to save code draft",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET - Retrieve saved draft
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const challengeId = searchParams.get("challengeId");
    const language = searchParams.get("language");

    if (!challengeId || !language) {
      return NextResponse.json(
        { error: "Missing required parameters: challengeId, language" },
        { status: 400 }
      );
    }

    // Retrieve from database using CodeDraft model
    const draft = await prisma.codeDraft.findUnique({
      where: {
        userId_challengeId: {
          userId: session.user.id,
          challengeId,
        },
      },
    });

    if (!draft) {
      return NextResponse.json({
        found: false,
        message: "No saved draft found. Using default starter code.",
      });
    }

    return NextResponse.json({
      found: true,
      code: draft.code,
      language: draft.language,
      lastSavedAt: draft.lastSavedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error retrieving code draft:", error);
    return NextResponse.json(
      { error: "Failed to retrieve code draft" },
      { status: 500 }
    );
  }
}
