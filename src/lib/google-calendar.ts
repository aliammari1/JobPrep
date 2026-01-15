import prisma from "@/lib/prisma";

interface GoogleCalendarEvent {
  summary: string;
  description?: string;
  start?: {
    dateTime: string;
    timeZone: string;
  };
  end?: {
    dateTime: string;
    timeZone: string;
  };
  startTime?: Date;
  endTime?: Date;
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  conferenceData?: {
    createRequest: {
      requestId: string;
      conferenceSolutionKey: {
        type: string;
      };
    };
  };
}

export async function getAccessToken(userId: string): Promise<string | null> {
  try {
    const account = await prisma.account.findFirst({
      where: {
        userId,
        providerId: "google-calendar",
      },
    });

    if (!account || !account.accessToken) {
      return null;
    }

    // Check if token is expired
    if (
      account.accessTokenExpiresAt &&
      account.accessTokenExpiresAt < new Date()
    ) {
      // Token expired, refresh it
      if (!account.refreshToken) {
        return null;
      }

      const refreshResponse = await fetch(
        "https://oauth2.googleapis.com/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            refresh_token: account.refreshToken,
            grant_type: "refresh_token",
          }),
        },
      );

      if (!refreshResponse.ok) {
        console.error("Failed to refresh token");
        return null;
      }

      const tokens = await refreshResponse.json();

      // Update the account with new access token
      await prisma.account.update({
        where: { id: account.id },
        data: {
          accessToken: tokens.access_token,
          accessTokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        },
      });

      return tokens.access_token;
    }

    return account.accessToken;
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
}

export async function createGoogleCalendarEvent(
  userId: string,
  event: GoogleCalendarEvent,
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const accessToken = await getAccessToken(userId);

    if (!accessToken) {
      return { success: false, error: "Not connected to Google Calendar" };
    }

    // Convert startTime/endTime to Google Calendar format if provided
    const calendarEvent = {
      ...event,
      start:
        event.start ||
        (event.startTime
          ? {
              dateTime: event.startTime.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            }
          : undefined),
      end:
        event.end ||
        (event.endTime
          ? {
              dateTime: event.endTime.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            }
          : undefined),
    };

    // Remove the temporary properties
    delete (calendarEvent as any).startTime;
    delete (calendarEvent as any).endTime;

    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(calendarEvent),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to create calendar event:", error);
      return { success: false, error: "Failed to create calendar event" };
    }

    const data = await response.json();
    return { success: true, eventId: data.id };
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return { success: false, error: "Failed to create calendar event" };
  }
}

export async function deleteGoogleCalendarEvent(
  userId: string,
  eventId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const accessToken = await getAccessToken(userId);

    if (!accessToken) {
      return { success: false, error: "Not connected to Google Calendar" };
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok && response.status !== 404) {
      return { success: false, error: "Failed to delete calendar event" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    return { success: false, error: "Failed to delete calendar event" };
  }
}

export async function isCalendarConnected(userId: string): Promise<boolean> {
  try {
    const account = await prisma.account.findFirst({
      where: {
        userId,
        providerId: "google-calendar",
      },
    });

    return !!account && !!account.accessToken;
  } catch (error) {
    console.error("Error checking calendar connection:", error);
    return false;
  }
}

/**
 * Fetch events from Google Calendar that aren't already synced to JobPrep
 */
export async function fetchGoogleCalendarEvents(
  userId: string,
): Promise<any[]> {
  try {
    const accessToken = await getAccessToken(userId);

    if (!accessToken) {
      return [];
    }

    // Fetch events from the primary calendar
    // Only get events from today onwards
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&timeMin=${new Date().toISOString()}&maxResults=250&orderBy=startTime`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      console.error("Failed to fetch calendar events");
      return [];
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return [];
  }
}

/**
 * Update an event in Google Calendar
 */
export async function updateGoogleCalendarEvent(
  userId: string,
  eventId: string,
  event: GoogleCalendarEvent,
): Promise<{ success: boolean; error?: string }> {
  try {
    const accessToken = await getAccessToken(userId);

    if (!accessToken) {
      return { success: false, error: "Not connected to Google Calendar" };
    }

    // Convert startTime/endTime to Google Calendar format if provided
    const calendarEvent = {
      ...event,
      start:
        event.start ||
        (event.startTime
          ? {
              dateTime: event.startTime.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            }
          : undefined),
      end:
        event.end ||
        (event.endTime
          ? {
              dateTime: event.endTime.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            }
          : undefined),
    };

    // Remove the temporary properties
    delete (calendarEvent as any).startTime;
    delete (calendarEvent as any).endTime;

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}?conferenceDataVersion=1`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(calendarEvent),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to update calendar event:", error);
      return { success: false, error: "Failed to update calendar event" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating calendar event:", error);
    return { success: false, error: "Failed to update calendar event" };
  }
}
