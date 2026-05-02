import path from 'path';
import fs from 'fs/promises';
import type { LegionPlugin } from './index';

export const readNotePlugin: LegionPlugin = {
    declaration: {
        name: "read_note",
        description: "Read a markdown note from the user's Obsidian SecondBrain vault.",
        parameters: {
            type: "OBJECT",
            properties: {
                path: { type: "STRING", description: "Relative path to the note (e.g., 'Ideas/Project.md')" }
            },
            required: ["path"]
        }
    },
    execute: async (args: any) => {
        const vaultPath = process.env.OBSIDIAN_VAULT_PATH || "/home/txmyer/sb";
        if (!args || !args.path) return { error: "Note path required." };
        const notePath = path.normalize(path.resolve(vaultPath, args.path));
        if (!notePath.startsWith(vaultPath)) return { error: "Security Violation: Path traversal outside vault." };
        
        try {
            const content = await fs.readFile(notePath, 'utf-8');
            return { content };
        } catch (e: any) {
            return { error: `Failed to read note: ${e.message}` };
        }
    }
};

export const appendNotePlugin: LegionPlugin = {
    declaration: {
        name: "append_note",
        description: "Append content to an existing markdown note in the Obsidian vault.",
        parameters: {
            type: "OBJECT",
            properties: {
                path: { type: "STRING", description: "Relative path to the note (e.g., 'Ideas/Project.md')" },
                content: { type: "STRING", description: "The markdown content to append" }
            },
            required: ["path", "content"]
        }
    },
    execute: async (args: any) => {
        const vaultPath = process.env.OBSIDIAN_VAULT_PATH || "/home/txmyer/sb";
        if (!args || !args.path || !args.content) return { error: "Note path and content required." };
        const notePath = path.normalize(path.resolve(vaultPath, args.path));
        if (!notePath.startsWith(vaultPath)) return { error: "Security Violation: Path traversal outside vault." };
        
        try {
            await fs.appendFile(notePath, "\n" + args.content);
            return { success: true, message: `Appended to ${args.path}` };
        } catch (e: any) {
            return { error: `Failed to append note: ${e.message}` };
        }
    }
};

export default [readNotePlugin, appendNotePlugin];
