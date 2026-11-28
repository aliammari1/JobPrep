import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Fetch all challenges or a specific challenge
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const difficulty = searchParams.get("difficulty");
    const category = searchParams.get("category");
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(searchParams.get("limit") || "10", 10) || 10),
    );
    const offset = Math.max(
      0,
      Number.parseInt(searchParams.get("offset") || "0", 10) || 0,
    );

    if (id) {
      // Fetch specific challenge from database
      const challenge = await prisma.challenge.findUnique({
        where: { id },
      });

      if (!challenge) {
        return NextResponse.json(
          { error: "Challenge not found" },
          { status: 404 },
        );
      }

      if (challenge.userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      return NextResponse.json({
        ...challenge,
        createdAt: challenge.createdAt.toISOString(),
        updatedAt: challenge.updatedAt.toISOString(),
      });
    }

    // Fetch challenges with filters from database
    const where: Record<string, any> = { userId: session.user.id };

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (category) {
      where.category = category;
    }

    const [challenges, total] = await Promise.all([
      prisma.challenge.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
      }),
      prisma.challenge.count({ where }),
    ]);

    return NextResponse.json({
      challenges: challenges.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
      total,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error("Error fetching challenges:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenges" },
      { status: 500 },
    );
  }
}

// POST - Create a new challenge (admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const {
      title,
      difficulty,
      description,
      constraints,
      examples,
      testCases,
      timeLimit,
      memoryLimit,
      category,
      tags,
    } = body;

    // Validate required fields
    if (!title || !difficulty || !description || !testCases) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Save to database
    const challenge = await prisma.codeSubmission.create({
      data: {
        userId: session.user.id,
        title,
        description,
        language: "javascript",
        code: JSON.stringify({
          difficulty,
          constraints,
          examples,
          testCases,
          timeLimit,
          memoryLimit,
          category,
          tags,
        }),
        testsPassed: 0,
        totalTests: 0,
        status: "draft",
      },
    });

    return NextResponse.json(challenge, { status: 201 });
  } catch (error) {
    console.error("Error creating challenge:", error);
    return NextResponse.json(
      { error: "Failed to create challenge" },
      { status: 500 },
    );
  }
}
