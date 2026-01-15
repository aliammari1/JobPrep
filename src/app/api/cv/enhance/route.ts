import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const cvData = await request.json();

    // Call AI service (Ollama/OpenAI) to enhance CV content
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2",
        prompt: `Enhance this CV content to be more professional and impactful. 
				
CV Data:
- Name: ${cvData.personalInfo.fullName}
- Summary: ${cvData.summary}
- Experience: ${JSON.stringify(cvData.experiences)}
- Skills: ${cvData.skills.join(", ")}

Provide improved versions of:
1. Professional summary
2. Experience descriptions (make them achievement-focused with quantifiable results)

Return ONLY valid JSON with this structure:
{
  "summary": "enhanced summary here",
  "experiences": [{"id": "...", "description": "enhanced description"}]
}`,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error("AI service unavailable");
    }

    const aiResponse = await response.json();
    let enhancedData;

    try {
      enhancedData = JSON.parse(aiResponse.response);
    } catch {
      // If AI doesn't return valid JSON, use original data
      return NextResponse.json(cvData);
    }

    // Merge enhanced data
    const enhanced = {
      ...cvData,
      summary: enhancedData.summary || cvData.summary,
      experiences: cvData.experiences.map((exp: any) => {
        const enhancedExp = enhancedData.experiences?.find(
          (e: any) => e.id === exp.id,
        );
        return enhancedExp
          ? { ...exp, description: enhancedExp.description }
          : exp;
      }),
    };

    return NextResponse.json(enhanced);
  } catch (error) {
    console.error("Enhancement error:", error);
    return NextResponse.json(
      { error: "Failed to enhance CV" },
      { status: 500 },
    );
  }
}
