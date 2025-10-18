import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
	try {
		// TODO: Get LinkedIn access token from database
		const accessToken = "";

		if (!accessToken) {
			throw new Error("Not connected to LinkedIn");
		}

		// Fetch full profile data
		const profileResponse = await axios.get("https://api.linkedin.com/v2/me", {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		const profile = profileResponse.data;

		// TODO: Parse and structure profile data for CV
		// This would include work experience, education, skills, etc.

		return NextResponse.json({
			personalInfo: {
				fullName: `${profile.firstName} ${profile.lastName}`,
				// Additional fields would be mapped here
			},
			experiences: [],
			education: [],
			skills: [],
		});
	} catch (error) {
		console.error("Import error:", error);
		return NextResponse.json(
			{ error: "Failed to import profile" },
			{ status: 500 }
		);
	}
}
