import { NextRequest, NextResponse } from "next/server";

// LinkedIn OAuth Configuration
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || "";
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || "";
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || "http://localhost:3000/api/integrations/linkedin/callback";

export async function GET(request: NextRequest) {
	try {
		// Generate state for CSRF protection
		const state = Math.random().toString(36).substring(7);

		// Store state in session/cookie for verification
		// TODO: Implement proper session management

		const authUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
		authUrl.searchParams.set("response_type", "code");
		authUrl.searchParams.set("client_id", LINKEDIN_CLIENT_ID);
		authUrl.searchParams.set("redirect_uri", LINKEDIN_REDIRECT_URI);
		authUrl.searchParams.set("state", state);
		authUrl.searchParams.set("scope", "openid profile email w_member_social");

		return NextResponse.json({ authUrl: authUrl.toString() });
	} catch (error) {
		console.error("LinkedIn auth error:", error);
		return NextResponse.json(
			{ error: "Failed to generate auth URL" },
			{ status: 500 }
		);
	}
}
