import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

// TODO: Get tokens from database
const getOAuthClient = () => {
	const oauth2Client = new google.auth.OAuth2(
		process.env.GOOGLE_CLIENT_ID,
		process.env.GOOGLE_CLIENT_SECRET,
		process.env.GOOGLE_REDIRECT_URI
	);

	// TODO: Load stored tokens
	// oauth2Client.setCredentials(tokens);

	return oauth2Client;
};

export async function GET(request: NextRequest) {
	try {
		const oauth2Client = getOAuthClient();
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
		const eventData = await request.json();
		const oauth2Client = getOAuthClient();
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
		const searchParams = request.nextUrl.searchParams;
		const eventId = searchParams.get("id");

		if (!eventId) {
			throw new Error("Event ID required");
		}

		const oauth2Client = getOAuthClient();
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
