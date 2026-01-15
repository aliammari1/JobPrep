import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || "";
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || "";
const LINKEDIN_REDIRECT_URI =
  process.env.LINKEDIN_REDIRECT_URI ||
  "http://localhost:3000/api/integrations/linkedin/callback";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code) {
      throw new Error("No authorization code received");
    }

    // Verify state for CSRF protection (should validate state parameter matches session state)
    // For production, implement proper state verification from secure session storage

    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: LINKEDIN_REDIRECT_URI,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const { access_token, expires_in } = tokenResponse.data;

    // Get user profile
    const profileResponse = await axios.get(
      "https://api.linkedin.com/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );

    const profile = profileResponse.data;

    // Store access token and profile in database
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session?.user) {
      await prisma.integrationToken.upsert({
        where: {
          userId_provider: {
            userId: session.user.id,
            provider: "linkedin",
          },
        },
        update: {
          accessToken: access_token,
          expiresAt: new Date(Date.now() + expires_in * 1000),
          profileData: profile,
          updatedAt: new Date(),
        },
        create: {
          userId: session.user.id,
          provider: "linkedin",
          accessToken: access_token,
          expiresAt: new Date(Date.now() + expires_in * 1000),
          scope: "openid profile email",
          profileData: profile,
        },
      });
    }

    // Close popup and redirect
    return new NextResponse(
      `
			<script>
				window.opener.postMessage({ type: 'linkedin-auth-success', profile: ${JSON.stringify(profile)} }, '*');
				window.close();
			</script>
			`,
      {
        headers: {
          "Content-Type": "text/html",
        },
      },
    );
  } catch (error) {
    console.error("LinkedIn callback error:", error);
    return new NextResponse(
      `
			<script>
				window.opener.postMessage({ type: 'linkedin-auth-error' }, '*');
				window.close();
			</script>
			`,
      {
        headers: {
          "Content-Type": "text/html",
        },
      },
    );
  }
}
