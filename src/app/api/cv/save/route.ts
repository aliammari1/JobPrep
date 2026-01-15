import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cvData = await request.json();
    const { title, content, fileUrl } = cvData;

    if (!content) {
      return NextResponse.json(
        { error: "CV content is required" },
        { status: 400 },
      );
    }

    // Save CV to database
    const cv = await prisma.cV.create({
      data: {
        userId: session.user.id,
        title: title || "Untitled CV",
        content,
        fileUrl,
      },
    });

    return NextResponse.json({ success: true, id: cv.id });
  } catch (error) {
    console.error("Save error:", error);
    return NextResponse.json({ error: "Failed to save CV" }, { status: 500 });
  }
}
