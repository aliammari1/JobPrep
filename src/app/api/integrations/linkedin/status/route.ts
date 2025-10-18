import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		// TODO: Check if LinkedIn tokens exist in database
		const connected = false;

		return NextResponse.json({ connected, profile: null });
	} catch (error) {
		return NextResponse.json({ connected: false, profile: null });
	}
}
