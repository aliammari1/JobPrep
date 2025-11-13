import { NextRequest, NextResponse } from "next/server";
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

		// Get tokens from database
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

		// Load stored tokens
		const oauth2Client = new google.auth.OAuth2(
			process.env.GOOGLE_CLIENT_ID,
			process.env.GOOGLE_CLIENT_SECRET,
			process.env.GOOGLE_REDIRECT_URI
		);

		oauth2Client.setCredentials({
			access_token: tokenRecord.accessToken,
			refresh_token: tokenRecord.refreshToken,
			expiry_date: tokenRecord.expiresAt?.getTime(),
		});

		const calendar = google.calendar({ version: "v3", auth: oauth2Client });

		const response = await calendar.events.list({
			calendarId: "primary",
			timeMin: new Date().toISOString(),
			maxResults: 10,
			singleEvents: true,
			orderBy: "startTime",
		});

		const events = response.data.items?.map((event) => ({
			id: event.id,
			summary: event.summary,
			description: event.description,
			startTime: event.start?.dateTime,
			endTime: event.end?.dateTime,
			attendees: event.attendees?.map((a) => a.email),
		}));

		return NextResponse.json({ events });
	} catch (error) {
		console.error("Get events error:", error);
		return NextResponse.json(
			{ error: "Failed to get events" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const eventData = await request.json();
		
		// Get tokens from database
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

		const oauth2Client = new google.auth.OAuth2(
			process.env.GOOGLE_CLIENT_ID,
			process.env.GOOGLE_CLIENT_SECRET,
			process.env.GOOGLE_REDIRECT_URI
		);

		oauth2Client.setCredentials({
			access_token: tokenRecord.accessToken,
			refresh_token: tokenRecord.refreshToken,
			expiry_date: tokenRecord.expiresAt?.getTime(),
		});

		const calendar = google.calendar({ version: "v3", auth: oauth2Client });

		const event = {
			summary: eventData.summary,
			description: eventData.description,
			start: {
				dateTime: eventData.startTime,
				timeZone: "UTC",
			},
			end: {
				dateTime: eventData.endTime,
				timeZone: "UTC",
			},
			attendees: eventData.attendees?.map((email: string) => ({ email })),
		};

		const response = await calendar.events.insert({
			calendarId: "primary",
			requestBody: event,
		});

		return NextResponse.json({ success: true, event: response.data });
	} catch (error) {
		console.error("Create event error:", error);
		return NextResponse.json(
			{ error: "Failed to create event" },
			{ status: 500 }
		);
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const searchParams = request.nextUrl.searchParams;
		const eventId = searchParams.get("id");

		if (!eventId) {
			throw new Error("Event ID required");
		}

		// Get tokens from database
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

		const oauth2Client = new google.auth.OAuth2(
			process.env.GOOGLE_CLIENT_ID,
			process.env.GOOGLE_CLIENT_SECRET,
			process.env.GOOGLE_REDIRECT_URI
		);

		oauth2Client.setCredentials({
			access_token: tokenRecord.accessToken,
			refresh_token: tokenRecord.refreshToken,
			expiry_date: tokenRecord.expiresAt?.getTime(),
		});

		const calendar = google.calendar({ version: "v3", auth: oauth2Client });

		await calendar.events.delete({
			calendarId: "primary",
			eventId,
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Delete event error:", error);
		return NextResponse.json(
			{ error: "Failed to delete event" },
			{ status: 500 }
		);
	}
}
