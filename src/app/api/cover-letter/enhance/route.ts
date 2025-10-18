import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const letterData = await request.json();

		const response = await fetch("http://localhost:11434/api/generate", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				model: "llama3.2",
				prompt: `Enhance this cover letter to be more compelling and professional.

Company: ${letterData.companyName}
Position: ${letterData.position}
Current Content: ${letterData.content.replace(/<[^>]*>/g, "")}

Improve the content by:
1. Making it more specific to the role
2. Highlighting relevant achievements
3. Using stronger action verbs
4. Maintaining professional tone
5. Keeping it concise (under 400 words)

Return ONLY the enhanced letter content as plain text, no JSON.`,
				stream: false,
			}),
		});

		if (!response.ok) {
			throw new Error("AI service unavailable");
		}

		const aiResponse = await response.json();
		const enhancedContent = aiResponse.response;

		return NextResponse.json({ content: enhancedContent });
	} catch (error) {
		console.error("Enhancement error:", error);
		return NextResponse.json(
			{ error: "Failed to enhance cover letter" },
			{ status: 500 }
		);
	}
}
