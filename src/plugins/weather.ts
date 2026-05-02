import { promisify } from 'util';
import { exec } from 'child_process';
import type { LegionPlugin } from './index';

const execAsync = promisify(exec);

export const weatherPlugin: LegionPlugin = {
    declaration: {
        name: "get_weather",
        description: "Get the current weather for a specific location.",
        parameters: {
            type: "OBJECT",
            properties: {
                location: { type: "STRING", description: "The city or location to get the weather for." }
            }
        }
    },
    execute: async (args: any) => {
        const location = args && args.location ? args.location : "";
        try {
            const { stdout } = await execAsync(`curl -s "wttr.in/${location}?format=3"`);
            return { weather: stdout.trim() };
        } catch (e: any) {
            return { error: `Failed to fetch weather: ${e.message}` };
        }
    }
};

export default weatherPlugin;
