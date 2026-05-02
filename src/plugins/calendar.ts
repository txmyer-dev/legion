import { manageCalendar } from '../calendar';
import type { LegionPlugin } from './index';

export const manageCalendarPlugin: LegionPlugin = {
    declaration: {
        name: "manage_calendar",
        description: "Manage Google Calendar events.",
        parameters: {
            type: "OBJECT",
            properties: {
                action: { type: "STRING", description: "list_events, create_event" },
                maxResults: { type: "INTEGER", description: "Max events to list" },
                summary: { type: "STRING", description: "Event title" },
                description: { type: "STRING", description: "Event description" },
                start: { type: "STRING", description: "ISO string for event start" },
                end: { type: "STRING", description: "ISO string for event end" }
            },
            required: ["action"]
        }
    },
    execute: async (args: any) => {
        if (args && args.action) {
            return await manageCalendar(args.action, args);
        }
        throw new Error("Calendar action argument missing.");
    }
};

export default manageCalendarPlugin;
