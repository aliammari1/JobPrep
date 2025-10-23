import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // userId
    const error = searchParams.get("error");

    if (error) {
      // User denied access or other OAuth error
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/interview-scheduler?error=oauth_denied`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/interview-scheduler?error=invalid_callback`
      );
    }

    // Verify the user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.id !== state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/interview-scheduler?error=unauthorized`
      );
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Token exchange failed:", errorData);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/interview-scheduler?error=token_exchange_failed`
      );
    }

    const tokens = await tokenResponse.json();

    // Store the tokens in the Account table
    const existingAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: "google-calendar",
      },
    });

    if (existingAccount) {
      // Update existing account with new tokens
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || existingAccount.refreshToken,
          accessTokenExpiresAt: new Date(
            Date.now() + tokens.expires_in * 1000
          ),
          scope: tokens.scope,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new account record for Google Calendar
      await prisma.account.create({
        data: {
          id: `${session.user.id}-google-calendar-${Date.now()}`,
          accountId: session.user.email,
          providerId: "google-calendar",
          userId: session.user.id,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          accessTokenExpiresAt: new Date(
            Date.now() + tokens.expires_in * 1000
          ),
          scope: tokens.scope,
        },
      });
    }

    // Redirect back to scheduler with success message
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/interview-scheduler?success=calendar_connected`
    );
  } catch (error) {
    console.error("Error in Google OAuth callback:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/interview-scheduler?error=callback_failed`
    );
  }
}
