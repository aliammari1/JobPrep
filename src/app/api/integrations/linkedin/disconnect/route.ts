import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		// TODO: Remove LinkedIn tokens from database

		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to disconnect" },
			{ status: 500 }
		);
	}
}
