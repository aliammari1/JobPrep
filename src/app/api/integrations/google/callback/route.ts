import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/integrations/google/callback";

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const code = searchParams.get("code");

		if (!code) {
			throw new Error("No authorization code received");
		}

		const oauth2Client = new google.auth.OAuth2(
			GOOGLE_CLIENT_ID,
			GOOGLE_CLIENT_SECRET,
			GOOGLE_REDIRECT_URI
		);

		const { tokens } = await oauth2Client.getToken(code);
		oauth2Client.setCredentials(tokens);

		// TODO: Store tokens in database

		return new NextResponse(
			`
			<script>
				window.opener.postMessage({ type: 'google-auth-success' }, '*');
				window.close();
			</script>
			`,
			{
				headers: {
					"Content-Type": "text/html",
				},
			}
		);
	} catch (error) {
		console.error("Google callback error:", error);
		return new NextResponse(
			`
			<script>
				window.opener.postMessage({ type: 'google-auth-error' }, '*');
				window.close();
			</script>
			`,
			{
				headers: {
					"Content-Type": "text/html",
				},
			}
		);
	}
}
