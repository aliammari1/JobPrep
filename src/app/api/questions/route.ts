import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/questions - Get all interview questions
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const templateId = searchParams.get("templateId");
    const questionType = searchParams.get("questionType");
    const difficulty = searchParams.get("difficulty");

    const where: any = {};

    if (templateId) {
      where.templateId = templateId;
    }

    if (questionType && questionType !== "all") {
      where.questionType = questionType;
    }

    if (difficulty && difficulty !== "all") {
      where.difficulty = difficulty;
    }

    const questions = await prisma.interviewQuestion.findMany({
      where,
      include: {
        template: {
          select: {
            id: true,
            title: true,
            category: true,
            isPublic: true,
          },
        },
        responses: {
          where: {
            interview: {
              candidateId: session.user.id,
            },
          },
          select: {
            id: true,
            aiScore: true,
            aiFeedback: true,
            submittedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 },
    );
  }
}

// POST /api/questions - Create a new question
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
      templateId,
      question,
      questionType,
      difficulty,
      expectedAnswer,
      timeLimit,
      codeLanguages,
      evaluationCriteria,
      order,
    } = body;

    if (!templateId || !question || !questionType || !difficulty) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Verify that the template belongs to the user or is public
    const template = await prisma.interviewTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 },
      );
    }

    if (template.createdBy !== session.user.id && !template.isPublic) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const newQuestion = await prisma.interviewQuestion.create({
      data: {
        templateId,
        question,
        questionType,
        difficulty,
        expectedAnswer,
        timeLimit,
        codeLanguages: codeLanguages || [],
        evaluationCriteria,
        order: order || 1,
      },
      include: {
        template: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
    });

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 },
    );
  }
}
