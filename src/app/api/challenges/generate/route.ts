import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { generateWithOllamaRetry, cleanJsonResponse } from "@/lib/ollama-client";


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

    const { cvData, jobDescription, difficulty = "Medium", count = 3 } = await req.json();

    if (!cvData || !jobDescription) {
      return NextResponse.json(
        { error: "CV data and job description are required" },
        { status: 400 }
      );
    }

    // Extract relevant skills from CV and job description
    const cvSkills = extractSkills(cvData);
    const jobSkills = extractSkills(jobDescription);
    const matchingSkills = cvSkills.filter((skill) =>
      jobSkills.some((js) => js.toLowerCase().includes(skill.toLowerCase()))
    );

    // Generate personalized coding challenges using Ollama (Local AI)
    const systemPrompt = "You are an expert technical interviewer specializing in creating personalized coding challenges. Always return valid JSON only. Format your response as a JSON array of challenges.";
    
    const prompt = `Generate ${count} coding challenges that are:
1. **Personalized** to the candidate's skills: ${cvSkills.join(", ")}
2. **Relevant** to the job requirements: ${jobSkills.join(", ")}
3. **Focused** on matching skills: ${matchingSkills.join(", ") || "general programming"}
4. **Difficulty**: ${difficulty}

For each challenge, provide:
- **title**: Clear, professional title
- **difficulty**: Easy/Medium/Hard
- **description**: Detailed problem statement (2-3 paragraphs)
- **constraints**: 4-5 technical constraints (array of strings)
- **examples**: 2 input/output examples with explanations (array of objects with input, output, explanation)
- **testCases**: 5 test cases (array of objects with id, input, expectedOutput)
- **timeLimit**: Milliseconds (100-2000)
- **memoryLimit**: MB (64-512)
- **category**: (Arrays, Strings, Trees, Graphs, Dynamic Programming, etc.)
- **tags**: 3-5 relevant tags (array of strings)
- **hints**: 2-3 progressive hints (array of strings)
- **starterCode**: Code templates (object with javascript, python, java, cpp, typescript, go keys)

**CV Context:**
${cvData.experience ? `Experience: ${cvData.experience.map((e: any) => `${e.title} at ${e.company}`).join(", ")}` : ""}
${cvData.skills ? `Skills: ${cvData.skills.join(", ")}` : ""}
${cvData.education ? `Education: ${cvData.education.map((e: any) => e.degree).join(", ")}` : ""}

**Job Description:**
${jobDescription}

Generate challenges that test real-world scenarios relevant to this position. Make them practical and interview-realistic.

Return ONLY a valid JSON array of ${count} challenges. No markdown, no explanations, just pure JSON array starting with [ and ending with ].`;

    console.log("🤖 Generating challenges with Ollama...");
    const responseText = await generateWithOllamaRetry(prompt, systemPrompt, 2);
    
    if (!responseText) {
      throw new Error("No response from Ollama");
    }

    console.log("📝 Raw Ollama response length:", responseText.length);
    
    // Clean and parse the JSON response
    const cleanedResponse = cleanJsonResponse(responseText);
    console.log("🧹 Cleaned response length:", cleanedResponse.length);
    
    let challenges;
    try {
      const parsed = JSON.parse(cleanedResponse);
      challenges = Array.isArray(parsed) ? parsed : (parsed.challenges || [parsed]);
    } catch (e) {
      console.error("❌ JSON parsing failed:", e);
      console.log("Failed response:", cleanedResponse.substring(0, 500));
      
      // Try to extract array manually
      const arrayMatch = cleanedResponse.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        try {
          challenges = JSON.parse(arrayMatch[0]);
        } catch (e2) {
          console.error("Array extraction also failed:", e2);
          throw new Error(`Failed to parse challenges after JSON repair: ${e2 instanceof Error ? e2.message : String(e2)}`);
        }
      } else {
        throw new Error("Could not extract valid JSON array from Ollama response");
      }
    }

    // Ensure challenges is an array
    if (!Array.isArray(challenges)) {
      challenges = [challenges];
    }

    console.log(`✅ Parsed ${challenges.length} challenges successfully`);

    // Add unique IDs and validate
    const userId = session.user.id;
    const validatedChallenges = challenges.map((challenge: any, index: number) => ({
      id: `gen_${userId}_${Date.now()}_${index}`,
      title: challenge.title || `Challenge ${index + 1}`,
      difficulty: challenge.difficulty || difficulty,
      description: challenge.description || "",
      constraints: challenge.constraints || [],
      examples: challenge.examples || [],
      testCases: (challenge.testCases || []).map((tc: any, i: number) => ({
        id: `${index}_${i}`,
        input: tc.input || "",
        expectedOutput: tc.expectedOutput || "",
      })),
      timeLimit: challenge.timeLimit || 1000,
      memoryLimit: challenge.memoryLimit || 256,
      category: challenge.category || "General",
      tags: challenge.tags || [],
      hints: challenge.hints || [],
      starterCode: challenge.starterCode || generateDefaultStarterCode(challenge.title),
    }));

    return NextResponse.json({
      success: true,
      challenges: validatedChallenges,
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
      { status: 500 }
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
    "JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust",
    "React", "Vue", "Angular", "Node.js", "Express", "Django", "Flask",
    "MongoDB", "PostgreSQL", "MySQL", "Redis", "Docker", "Kubernetes",
    "AWS", "Azure", "GCP", "Git", "CI/CD", "REST API", "GraphQL",
    "Machine Learning", "Data Structures", "Algorithms", "System Design",
    "Microservices", "Testing", "Agile", "Scrum", "TDD", "BDD"
  ];

  const textLower = text.toLowerCase();
  return commonSkills.filter(skill => 
    textLower.includes(skill.toLowerCase())
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