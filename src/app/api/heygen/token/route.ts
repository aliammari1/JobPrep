import { NextResponse } from "next/server";

/**
 * HeyGen Token Generation API
 * 
 * Generates a session token for HeyGen Streaming Avatar SDK
 * Requires HEYGEN_API_KEY environment variable
 */
export async function POST() {
	try {
		const apiKey = process.env.HEYGEN_API_KEY;

		if (!apiKey) {
			return NextResponse.json(
				{ error: "HEYGEN_API_KEY not configured" },
				{ status: 500 }
			);
		}

		const response = await fetch(
			"https://api.heygen.com/v1/streaming.create_token",
			{
				method: "POST",
				headers: {
					"x-api-key": apiKey,
				},
			}
		);

		if (!response.ok) {
			const error = await response.text();
			console.error("HeyGen token generation failed:", error);
			return NextResponse.json(
				{ error: "Failed to generate token" },
				{ status: response.status }
			);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error generating HeyGen token:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
