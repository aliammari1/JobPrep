import { NextRequest, NextResponse } from "next/server";
import ical from "ical-generator";
import { google } from "googleapis";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Load stored tokens from database
		const tokenRecord = await prisma.integrationToken.findUnique({
			where: {
				userId_provider: {
					userId: session.user.id,
					provider: 'google',
				}
			}
		});
		
		if (!tokenRecord?.accessToken) {
			return NextResponse.json(
				{ error: 'Google Calendar not connected' },
				{ status: 401 }
			);
		}
		
		const tokens = {
			access_token: tokenRecord.accessToken,
			refresh_token: tokenRecord.refreshToken,
			expiry_date: tokenRecord.expiresAt?.getTime(),
		};

		const oauth2Client = new google.auth.OAuth2(
			process.env.GOOGLE_CLIENT_ID,
			process.env.GOOGLE_CLIENT_SECRET,
			process.env.GOOGLE_REDIRECT_URI
		);
		oauth2Client.setCredentials(tokens);

		const calendar = google.calendar({ version: "v3", auth: oauth2Client });

		const response = await calendar.events.list({
			calendarId: "primary",
			timeMin: new Date().toISOString(),
			maxResults: 100,
			singleEvents: true,
			orderBy: "startTime",
		});

		// Create ICS file
		const cal = ical({ name: "Interview Schedule" });

		response.data.items?.forEach((event) => {
			if (event.start?.dateTime && event.end?.dateTime) {
				cal.createEvent({
					start: new Date(event.start.dateTime),
					end: new Date(event.end.dateTime),
					summary: event.summary || "Interview",
					description: event.description || "",
					location: event.location || "",
				});
			}
		});

		return new NextResponse(cal.toString(), {
			headers: {
				"Content-Type": "text/calendar",
				"Content-Disposition": "attachment; filename=interviews.ics",
			},
		});
	} catch (error) {
		console.error("Export error:", error);
		return NextResponse.json(
			{ error: "Failed to export calendar" },
			{ status: 500 }
		);
	}
}
