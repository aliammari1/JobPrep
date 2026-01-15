import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get LinkedIn access token from database
    const tokenRecord = await prisma.integrationToken.findUnique({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider: "linkedin",
        },
      },
    });

    if (!tokenRecord?.accessToken) {
      return NextResponse.json(
        { error: "LinkedIn not connected" },
        { status: 401 },
      );
    }

    const accessToken = tokenRecord.accessToken;

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

    // Parse and structure profile data for CV
    // LinkedIn OpenID Connect returns: sub, name, email, picture, locale, etc.
    // Full profile endpoint would return more detailed information
    const cvData = {
      personalInfo: {
        fullName: profile.name || "",
        email: profile.email || "",
        picture: profile.picture || null,
        locale: profile.locale || "en_US",
      },
      // The OpenID Connect endpoint provides limited data
      // For full CV data, would need to use LinkedIn v2 API with specific scopes
      // and handle pagination for experiences, education, skills arrays
      experiences: [],
      education: [],
      skills: [],
      summary: profile.profile_summary || "",
    };

    return NextResponse.json(cvData);
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Failed to import profile" },
      { status: 500 },
    );
  }
}
