import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const _cvData = await request.json();

		// TODO: Implement database save when CV model is added to schema
		// For now, return success as the app uses localStorage
		const mockId = `cv-${Date.now()}`;

		return NextResponse.json({ success: true, id: mockId });
	} catch (error) {
		console.error("Save error:", error);
		return NextResponse.json(
			{ error: "Failed to save CV" },
			{ status: 500 }
		);
	}
}
