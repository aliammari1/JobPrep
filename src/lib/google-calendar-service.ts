/**
 * Google Calendar Service Integration
 * Handles OAuth, event creation/update/deletion, and sync
 */

import { google } from 'googleapis';

export interface CalendarEvent {
  summary: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: string[];
  conferenceData?: {
    conferenceType: 'hangoutsMeet' | 'addOnHangouts';
  };
  reminders?: Array<{
    method: 'email' | 'popup';
    minutes: number;
  }>;
}

interface CalendarSyncConfig {
  accessToken: string;
  refreshToken?: string;
  expiryDate?: number;
}

class GoogleCalendarService {
  private calendarId = 'primary';

  getAuthUrl(): string {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ];

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }

  async exchangeCodeForTokens(code: string) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    try {
      const { tokens } = await oauth2Client.getToken(code);
      return tokens;
    } catch (error: any) {
      console.error('Error exchanging code for tokens:', error);
      throw error;
    }
  }

  private getOAuth2Client(config: CalendarSyncConfig) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: config.accessToken,
      refresh_token: config.refreshToken,
      expiry_date: config.expiryDate,
    });

    return oauth2Client;
  }

  async createEvent(
    event: CalendarEvent,
    config: CalendarSyncConfig
  ): Promise<string> {
    try {
      const oauth2Client = this.getOAuth2Client(config);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const eventData: any = {
        summary: event.summary,
        description: event.description,
        start: {
          dateTime: event.startTime.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: event.endTime.toISOString(),
          timeZone: 'UTC',
        },
        location: event.location,
        attendees: event.attendees?.map((email) => ({ email })),
        reminders: {
          useDefault: false,
          overrides: event.reminders || [
            { method: 'email', minutes: 24 * 60 }, // 24 hours
            { method: 'popup', minutes: 15 },
          ],
        },
      };

      // Add video conference if specified
      if (event.conferenceData) {
        eventData.conferenceData = {
          createRequest: {
            requestId: `conference-${Date.now()}`,
            conferenceSolutionKey: {
              key: event.conferenceData.conferenceType,
            },
          },
        };
      }

      const response = await calendar.events.insert({
        calendarId: this.calendarId,
        requestBody: eventData,
        conferenceDataVersion: event.conferenceData ? 1 : 0,
      });

      return response.data.id!;
    } catch (error: any) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  async updateEvent(
    eventId: string,
    event: Partial<CalendarEvent>,
    config: CalendarSyncConfig
  ): Promise<void> {
    try {
      const oauth2Client = this.getOAuth2Client(config);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      // Get existing event first
      const existingEvent = await calendar.events.get({
        calendarId: this.calendarId,
        eventId,
      });

      const eventData: any = {
        ...existingEvent.data,
        summary: event.summary || existingEvent.data.summary,
        description: event.description || existingEvent.data.description,
      };

      if (event.startTime) {
        eventData.start = {
          dateTime: event.startTime.toISOString(),
          timeZone: 'UTC',
        };
      }

      if (event.endTime) {
        eventData.end = {
          dateTime: event.endTime.toISOString(),
          timeZone: 'UTC',
        };
      }

      if (event.location) {
        eventData.location = event.location;
      }

      if (event.attendees) {
        eventData.attendees = event.attendees.map((email) => ({ email }));
      }

      await calendar.events.update({
        calendarId: this.calendarId,
        eventId,
        requestBody: eventData,
      });
    } catch (error: any) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  }

  async deleteEvent(
    eventId: string,
    config: CalendarSyncConfig
  ): Promise<void> {
    try {
      const oauth2Client = this.getOAuth2Client(config);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      await calendar.events.delete({
        calendarId: this.calendarId,
        eventId,
      });
    } catch (error: any) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  }

  async getUpcomingEvents(
    config: CalendarSyncConfig,
    maxResults: number = 10
  ) {
    try {
      const oauth2Client = this.getOAuth2Client(config);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const response = await calendar.events.list({
        calendarId: this.calendarId,
        timeMin: new Date().toISOString(),
        maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items || [];
    } catch (error: any) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  }

  async syncFromGoogle(
    config: CalendarSyncConfig,
    options?: { timeMin?: Date; timeMax?: Date }
  ) {
    try {
      const oauth2Client = this.getOAuth2Client(config);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const response = await calendar.events.list({
        calendarId: this.calendarId,
        timeMin: options?.timeMin?.toISOString() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        timeMax: options?.timeMax?.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items || [];
    } catch (error: any) {
      console.error('Error syncing from Google Calendar:', error);
      throw error;
    }
  }
}

export const googleCalendarService = new GoogleCalendarService();
