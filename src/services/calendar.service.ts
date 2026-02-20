import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

export const calendarService = {
    getAuthUrl: () => {
        const scopes = [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events',
        ];
        return oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent'
        });
    },

    setCredentials: (tokens: any) => {
        oauth2Client.setCredentials(tokens);
    },

    listEvents: async (calendarId: string = 'primary') => {
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        try {
            const response = await calendar.events.list({
                calendarId,
                timeMin: new Date().toISOString(),
                maxResults: 10,
                singleEvents: true,
                orderBy: 'startTime',
            });
            return response.data.items;
        } catch (error) {
            console.error('Error listing events:', error);
            throw error;
        }
    },

    createEvent: async (eventData: any, calendarId: string = 'primary') => {
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        try {
            const response = await calendar.events.insert({
                calendarId,
                requestBody: {
                    summary: eventData.title,
                    description: eventData.description,
                    start: { dateTime: eventData.start },
                    end: { dateTime: eventData.end },
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    },

    checkAvailability: async (start: string, end: string, calendarId: string = 'primary') => {
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        try {
            const response = await calendar.freebusy.query({
                requestBody: {
                    timeMin: start,
                    timeMax: end,
                    items: [{ id: calendarId }],
                },
            });
            const busy = response.data.calendars?.[calendarId]?.busy || [];
            return busy.length === 0;
        } catch (error) {
            console.error('Error checking availability:', error);
            throw error;
        }
    }
};
