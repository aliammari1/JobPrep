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

    const letterData = await request.json();
    const { title, content, jobTitle, company } = letterData;

    if (!content) {
      return NextResponse.json(
        { error: "Cover letter content is required" },
        { status: 400 },
      );
    }

    // Save cover letter to database
    const coverLetter = await prisma.coverLetter.create({
      data: {
        userId: session.user.id,
        title: title || "Untitled Cover Letter",
        content,
        jobTitle,
        company,
      },
    });

    return NextResponse.json({ success: true, id: coverLetter.id });
  } catch (error) {
    console.error("Save error:", error);
    return NextResponse.json(
      { error: "Failed to save cover letter" },
      { status: 500 },
    );
  }
}
