import { google } from 'googleapis';

export async function manageCalendar(action: string, args: any): Promise<any> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        return { error: "Google API credentials not found in environment." };
    }

    const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oAuth2Client.setCredentials({ refresh_token: refreshToken });
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    try {
        switch (action) {
            case 'list_events': {
                const maxResults = args.maxResults || 10;
                const timeMin = args.timeMin || new Date().toISOString();
                const res = await calendar.events.list({
                    calendarId: 'primary',
                    timeMin,
                    maxResults,
                    singleEvents: true,
                    orderBy: 'startTime',
                });
                return { events: res.data.items };
            }
            case 'create_event': {
                if (!args.summary || !args.start || !args.end) {
                    return { error: "summary, start, and end are required for create_event" };
                }
                const event = {
                    summary: args.summary,
                    description: args.description || '',
                    start: { dateTime: args.start },
                    end: { dateTime: args.end },
                };
                const res = await calendar.events.insert({
                    calendarId: 'primary',
                    requestBody: event,
                });
                return { success: true, eventLink: res.data.htmlLink };
            }
            default:
                throw new Error(`Unknown calendar action: ${action}`);
        }
    } catch (e: any) {
        return { error: `Calendar API error: ${e.message}` };
    }
}
