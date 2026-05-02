import type { LegionPlugin } from './index';

export const generateImagePlugin: LegionPlugin = {
    declaration: {
        name: "generate_image",
        description: "Generate an image using DALL-E 3 based on a text prompt.",
        parameters: {
            type: "OBJECT",
            properties: {
                prompt: { type: "STRING", description: "The descriptive text prompt for the image." },
                size: { type: "STRING", description: "The size of the image, e.g., '1024x1024'" }
            },
            required: ["prompt"]
        }
    },
    execute: async (args: any) => {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) return { error: "OPENAI_API_KEY not found in environment." };
        if (!args || !args.prompt) return { error: "Prompt is required." };
        
        const response = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "dall-e-3",
                prompt: args.prompt,
                n: 1,
                size: args.size || "1024x1024"
            })
        });

        if (!response.ok) return { error: `Image Gen API error: ${response.statusText}` };
        
        const result = await response.json() as any;
        if (result.data && result.data.length > 0) {
            return { success: true, url: result.data[0].url };
        }
        return { error: "No image generated." };
    }
};

export default generateImagePlugin;
