import { manipulateBrowser } from '../browser';
import type { LegionPlugin } from './index';

export const manipulateBrowserPlugin: LegionPlugin = {
    declaration: {
        name: "manipulate_browser",
        description: "Perform an action on the headless browser.",
        parameters: {
            type: "OBJECT",
            properties: {
                action: { type: "STRING", description: "goto, click, type, extract, screenshot, close" },
                url: { type: "STRING" },
                selector: { type: "STRING" },
                value: { type: "STRING" }
            },
            required: ["action"]
        }
    },
    execute: async (args: any) => {
        if (args && args.action) {
            return await manipulateBrowser(args.action, args.url, args.selector, args.value);
        }
        throw new Error("Browser action argument missing.");
    }
};

export default manipulateBrowserPlugin;
