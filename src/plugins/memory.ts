import fs from 'fs';
import path from 'path';
import type { LegionPlugin } from './index';

const MEMORY_DIR = path.resolve(__dirname, '../../memory');
const CORE_FILE = path.join(MEMORY_DIR, 'core.md');

function ensureMemoryDir() {
    if (!fs.existsSync(MEMORY_DIR)) fs.mkdirSync(MEMORY_DIR, { recursive: true });
    if (!fs.existsSync(CORE_FILE)) {
        fs.writeFileSync(CORE_FILE, '# Ekko Memory\n\n## Notes\n\n', 'utf-8');
    }
}

// ── read_memory ──────────────────────────────────────────────────────────────
export const readMemoryPlugin: LegionPlugin = {
    declaration: {
        name: "read_memory",
        description: "Read Ekko's persistent memory file. Use this to recall what you know about the user, their preferences, goals, and notes.",
        parameters: {
            type: "OBJECT",
            properties: {
                section: {
                    type: "STRING",
                    description: "Optional. The specific section heading to read (e.g., 'About You', 'Goals'). If omitted, returns the full memory file."
                }
            }
        }
    },
    execute: async (args: any) => {
        ensureMemoryDir();
        const content = fs.readFileSync(CORE_FILE, 'utf-8');

        if (args?.section) {
            const heading = args.section.trim();
            // Find the section and extract until the next heading
            const regex = new RegExp(`## ${heading}\\n([\\s\\S]*?)(?=\\n## |$)`, 'i');
            const match = content.match(regex);
            if (!match || match[1] === undefined) return { error: `Section "${heading}" not found in memory.` };
            return { section: heading, content: match[1].trim() };

        }

        return { content };
    }
};

// ── write_memory ─────────────────────────────────────────────────────────────
export const writeMemoryPlugin: LegionPlugin = {
    declaration: {
        name: "write_memory",
        description: "Write or update a section in Ekko's persistent memory. Use this to remember facts about the user, save their preferences, or record notes for later.",
        parameters: {
            type: "OBJECT",
            properties: {
                section: {
                    type: "STRING",
                    description: "The section heading to write to (e.g., 'About You', 'Preferences', 'Goals', 'Notes')"
                },
                content: {
                    type: "STRING",
                    description: "The markdown content to write into this section"
                },
                mode: {
                    type: "STRING",
                    description: "How to update: 'replace' (overwrite the section) or 'append' (add to the end of the section). Default: 'append'"
                }
            },
            required: ["section", "content"]
        }
    },
    execute: async (args: any) => {
        if (!args?.section || !args?.content) return { error: "section and content are required." };
        ensureMemoryDir();

        const mode = args.mode === 'replace' ? 'replace' : 'append';
        let fileContent = fs.readFileSync(CORE_FILE, 'utf-8');
        const heading = args.section.trim();
        const newBlock = `## ${heading}\n\n${args.content.trim()}\n`;
        const regex = new RegExp(`## ${heading}\\n[\\s\\S]*?(?=\\n## |$)`, 'i');

        if (regex.test(fileContent)) {
            if (mode === 'replace') {
                fileContent = fileContent.replace(regex, newBlock);
            } else {
                // append mode — add content to end of existing section
                fileContent = fileContent.replace(
                    regex,
                    (match) => match.trimEnd() + '\n\n' + args.content.trim() + '\n'
                );
            }
        } else {
            // Section doesn't exist — add it
            fileContent = fileContent.trimEnd() + '\n\n---\n\n' + newBlock;
        }

        fs.writeFileSync(CORE_FILE, fileContent, 'utf-8');
        return { success: true, message: `Memory section "${heading}" updated (${mode} mode).` };
    }
};

// ── search_memory ─────────────────────────────────────────────────────────────
export const searchMemoryPlugin: LegionPlugin = {
    declaration: {
        name: "search_memory",
        description: "Search Ekko's memory for a keyword or phrase. Returns all matching lines with context.",
        parameters: {
            type: "OBJECT",
            properties: {
                query: {
                    type: "STRING",
                    description: "The search term to look for in memory"
                }
            },
            required: ["query"]
        }
    },
    execute: async (args: any) => {
        if (!args?.query) return { error: "query is required." };
        ensureMemoryDir();

        const content = fs.readFileSync(CORE_FILE, 'utf-8');
        const lines = content.split('\n');
        const query = args.query.toLowerCase();
        const results: { line: number; text: string }[] = [];

        lines.forEach((line, idx) => {
            if (line.toLowerCase().includes(query)) {
                results.push({ line: idx + 1, text: line });
            }
        });

        if (results.length === 0) return { found: false, message: `No results for "${args.query}"` };
        return { found: true, count: results.length, results };
    }
};

export default [readMemoryPlugin, writeMemoryPlugin, searchMemoryPlugin];
