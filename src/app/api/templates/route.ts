import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/templates - Get all interview templates
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const isPublic = searchParams.get("isPublic");

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (isPublic !== null) {
      where.isPublic = isPublic === "true";
    } else {
      // By default, show public templates or user's own templates
      where.OR = [{ isPublic: true }, { createdBy: session.user.id }];
    }

    const templates = await prisma.interviewTemplate.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        questions: {
          orderBy: {
            order: "asc",
          },
          select: {
            id: true,
            question: true,
            questionType: true,
            difficulty: true,
            timeLimit: true,
            order: true,
          },
        },
        _count: {
          select: {
            questions: true,
            interviews: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

// POST /api/templates - Create a new interview template
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      category,
      difficulty,
      duration,
      isPublic,
      tags,
      questions,
    } = body;

    // Validate required fields
    if (!title || !category || !difficulty || !duration) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the template with questions
    const template = await prisma.interviewTemplate.create({
      data: {
        title,
        description,
        category,
        difficulty,
        duration,
        isPublic: isPublic || false,
        tags: tags || [],
        createdBy: session.user.id,
        questions: questions
          ? {
              create: questions.map((q: any, index: number) => ({
                question: q.question,
                questionType: q.questionType,
                difficulty: q.difficulty,
                expectedAnswer: q.expectedAnswer,
                timeLimit: q.timeLimit,
                codeLanguages: q.codeLanguages || [],
                evaluationCriteria: q.evaluationCriteria,
                order: index + 1,
              })),
            }
          : undefined,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        questions: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}
