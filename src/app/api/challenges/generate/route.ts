import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { generateStructuredOutputRetry } from "@/lib/ollama-client";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Define the challenge schema for structured output
const challengeSchema = z.object({
  challenges: z.array(
    z.object({
      title: z.string(),
      difficulty: z.enum(["Easy", "Medium", "Hard"]),
      description: z.string(),
      constraints: z.array(z.string()),
      examples: z.array(
        z.object({
          input: z.string(),
          output: z.string(),
          explanation: z.string(),
        }),
      ),
      testCases: z.array(
        z.object({
          id: z.string(),
          input: z.string(),
          expectedOutput: z.string(),
        }),
      ),
      timeLimit: z.number(),
      memoryLimit: z.number(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      hints: z.array(z.string()).optional(),
      starterCode: z
        .object({
          javascript: z.string().optional(),
          python: z.string().optional(),
          java: z.string().optional(),
          cpp: z.string().optional(),
          typescript: z.string().optional(),
          go: z.string().optional(),
        })
        .optional(),
    }),
  ),
});

/**
 * Generate personalized coding challenges for a candidate using CV data and a job description.
 *
 * Validates the authenticated session and required input, queries a local Ollama AI to produce a JSON
 * array of challenges, attempts robust JSON repair/parsing, normalizes and enriches each challenge
 * (adds unique IDs, defaults, starter code), and returns the result with metadata about extracted skills.
 *
 * @param req - NextRequest whose JSON body must include `cvData` and `jobDescription`. Optional fields: `difficulty` (default "Medium") and `count` (default 3).
 * @returns A JSON HTTP response. On success: an object with `success: true`, `challenges` (array of normalized challenge objects), and `metadata` containing `cvSkills`, `jobSkills`, `matchingSkills`, and `generatedAt`. On failure: an error object `{ error: string, details?: string }` with an appropriate HTTP status code.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      cvData,
      jobDescription,
      difficulty = "Medium",
      count = 3,
    } = await req.json();

    if (!cvData || !jobDescription) {
      return NextResponse.json(
        { error: "CV data and job description are required" },
        { status: 400 },
      );
    }

    // Extract relevant skills from CV and job description
    const cvSkills = extractSkills(cvData);
    const jobSkills = extractSkills(jobDescription);
    const matchingSkills = cvSkills.filter((skill) =>
      jobSkills.some((js) => js.toLowerCase().includes(skill.toLowerCase())),
    );

    // Generate personalized coding challenges using Ollama with Vercel AI SDK
    const systemPrompt = `You are an expert technical interviewer. Generate ONLY valid JSON. No explanations, no markdown, just pure JSON.`;

    const cvExperience = cvData.experience
      ? cvData.experience
          .map((e: any) => `${e.title} at ${e.company}`)
          .join(", ")
      : "N/A";

    const prompt = `Generate ${count} coding challenges in this EXACT JSON format:

{
  "challenges": [
    {
      "title": "string",
      "difficulty": "Easy" | "Medium" | "Hard",
      "description": "string",
      "constraints": ["string"],
      "examples": [{"input": "string", "output": "string", "explanation": "string"}],
      "testCases": [{"id": "string", "input": "string", "expectedOutput": "string"}],
      "timeLimit": number,
      "memoryLimit": number,
      "category": "string",
      "tags": ["string"],
      "hints": ["string"],
      "starterCode": {
        "javascript": "string",
        "python": "string",
        "java": "string",
        "cpp": "string",
        "typescript": "string",
        "go": "string"
      }
    }
  ]
}

Requirements:
- Personalized to skills: ${cvSkills.join(", ")}
- Relevant to job: ${jobSkills.join(", ")}
- Matching skills: ${matchingSkills.join(", ") || "general programming"}
- Difficulty: ${difficulty}
- Generate exactly ${count} challenges
- Each challenge must have 2 examples and 5 test cases
- timeLimit: 100-2000 milliseconds
- memoryLimit: 64-512 MB

CV: ${cvExperience}
Job: ${jobDescription.substring(0, 500)}

Return ONLY the JSON object. Start with { and end with }. No other text.`;

    console.log("🤖 Generating challenges with Ollama (Vercel AI SDK)...");

    const result = await generateStructuredOutputRetry(
      prompt,
      challengeSchema,
      systemPrompt,
      3,
    );

    console.log(
      `✅ Generated ${result.challenges.length} challenges successfully`,
    );

    // Save challenges to database and return with IDs
    const userId = session.user.id;

    const savedChallenges = await Promise.all(
      result.challenges.map(async (challenge) => {
        return await prisma.challenge.create({
          data: {
            userId,
            title: challenge.title || "Untitled Challenge",
            difficulty: challenge.difficulty || difficulty,
            description: challenge.description || "",
            constraints: challenge.constraints || [],
            examples: challenge.examples || [],
            testCases: challenge.testCases || [],
            timeLimit: challenge.timeLimit || 1000,
            memoryLimit: challenge.memoryLimit || 256,
            category: challenge.category || "General",
            tags: challenge.tags || [],
            hints: challenge.hints || [],
            starterCode:
              challenge.starterCode ||
              generateDefaultStarterCode(challenge.title || "Challenge"),
          },
        });
      }),
    );

    return NextResponse.json({
      success: true,
      challenges: savedChallenges,
      metadata: {
        cvSkills,
        jobSkills,
        matchingSkills,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error generating challenges:", error);
    return NextResponse.json(
      {
        error: "Failed to generate challenges",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Helper function to extract skills from text
function extractSkills(text: string | any): string[] {
  if (typeof text === "object") {
    // Extract from structured CV data
    const skills: string[] = [];
    if (text.skills) skills.push(...text.skills);
    if (text.technicalSkills) skills.push(...text.technicalSkills);
    if (text.experience) {
      text.experience.forEach((exp: any) => {
        if (exp.technologies) skills.push(...exp.technologies);
        if (exp.skills) skills.push(...exp.skills);
      });
    }
    return [...new Set(skills)];
  }

  // Extract from text
  const commonSkills = [
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "C++",
    "Go",
    "Rust",
    "React",
    "Vue",
    "Angular",
    "Node.js",
    "Express",
    "Django",
    "Flask",
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "Redis",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "GCP",
    "Git",
    "CI/CD",
    "REST API",
    "GraphQL",
    "Machine Learning",
    "Data Structures",
    "Algorithms",
    "System Design",
    "Microservices",
    "Testing",
    "Agile",
    "Scrum",
    "TDD",
    "BDD",
  ];

  const textLower = text.toLowerCase();
  return commonSkills.filter((skill) =>
    textLower.includes(skill.toLowerCase()),
  );
}

// Generate default starter code if AI doesn't provide it
function generateDefaultStarterCode(title: string) {
  return {
    javascript: `function solution() {
  // ${title}
  // Your solution here
}`,
    python: `def solution():
    # ${title}
    # Your solution here
    pass`,
    java: `public class Solution {
    // ${title}
    public void solution() {
        // Your solution here
    }
}`,
    cpp: `#include <iostream>
using namespace std;

// ${title}
void solution() {
    // Your solution here
}`,
    typescript: `function solution(): void {
  // ${title}
  // Your solution here
}`,
    go: `package main

// ${title}
func solution() {
    // Your solution here
}`,
  };
}
