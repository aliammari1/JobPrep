import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const _letterData = await request.json();

		// TODO: Implement database save when CoverLetter model is added to schema
		// For now, return success as the app uses localStorage
		const mockId = `letter-${Date.now()}`;

		return NextResponse.json({ success: true, id: mockId });
	} catch (error) {
		console.error("Save error:", error);
		return NextResponse.json(
			{ error: "Failed to save cover letter" },
			{ status: 500 }
		);
	}
}
