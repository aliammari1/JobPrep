import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		// TODO: Check if user has stored tokens in database
		const connected = false; // Placeholder

		return NextResponse.json({ connected });
	} catch (error) {
		return NextResponse.json({ connected: false });
	}
}
