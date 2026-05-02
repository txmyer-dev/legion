import fs from 'fs';
import path from 'path';
import type { LegionPlugin } from './index';

const LOGS_DIR = path.resolve(process.cwd(), 'docs', 'logs');

function getLogFiles(): string[] {
    if (!fs.existsSync(LOGS_DIR)) return [];
    return fs.readdirSync(LOGS_DIR)
        .filter(f => f.endsWith('.md') && f.includes('session'))
        .sort()
        .reverse(); // most recent first
}

function searchInFile(filePath: string, query: string, contextLines = 2): string[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const lower = query.toLowerCase();
    const results: string[] = [];

    lines.forEach((line, idx) => {
        if (line.toLowerCase().includes(lower)) {
            const start = Math.max(0, idx - contextLines);
            const end = Math.min(lines.length - 1, idx + contextLines);
            const block = lines.slice(start, end + 1).join('\n');
            results.push(`[Line ${idx + 1}]: ${block}`);
        }
    });

    return results;
}

// ── session_search ────────────────────────────────────────────────────────────
export const sessionSearchPlugin: LegionPlugin = {
    declaration: {
        name: "session_search",
        description: "Search past conversation transcripts for a keyword or phrase. Useful for recalling what was said or decided in previous sessions.",
        parameters: {
            type: "OBJECT",
            properties: {
                query: {
                    type: "STRING",
                    description: "The keyword or phrase to search for in session logs"
                },
                days: {
                    type: "NUMBER",
                    description: "How many days back to search. Default: 7"
                },
                limit: {
                    type: "NUMBER",
                    description: "Max number of matching excerpts to return. Default: 10"
                }
            },
            required: ["query"]
        }
    },
    execute: async (args: any) => {
        if (!args?.query) return { error: "query is required." };

        const days = Math.min(args.days ?? 7, 30);
        const limit = Math.min(args.limit ?? 10, 30);
        const query = args.query;

        const files = getLogFiles();
        if (files.length === 0) {
            return { found: false, message: "No session logs found." };
        }

        // Filter to requested date range
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        const allResults: { file: string; excerpt: string }[] = [];

        for (const file of files) {
            // Extract date from filename: YYYY-MM-DD-session.md
            const dateStr = file.split('-session')[0];
            const fileDate = new Date(dateStr);
            if (isNaN(fileDate.getTime()) || fileDate < cutoff) continue;

            const filePath = path.join(LOGS_DIR, file);
            const matches = searchInFile(filePath, query);
            for (const excerpt of matches) {
                allResults.push({ file: dateStr, excerpt });
                if (allResults.length >= limit) break;
            }
            if (allResults.length >= limit) break;
        }

        if (allResults.length === 0) {
            return { found: false, message: `No results for "${query}" in the last ${days} days.` };
        }

        return {
            found: true,
            query,
            count: allResults.length,
            results: allResults
        };
    }
};

// ── list_sessions ─────────────────────────────────────────────────────────────
export const listSessionsPlugin: LegionPlugin = {
    declaration: {
        name: "list_sessions",
        description: "List available session transcript files by date.",
        parameters: {
            type: "OBJECT",
            properties: {
                limit: {
                    type: "NUMBER",
                    description: "How many recent sessions to show. Default: 10"
                }
            }
        }
    },
    execute: async (args: any) => {
        const files = getLogFiles();
        if (files.length === 0) return { empty: true, message: "No session logs found." };
        const limit = Math.min(args?.limit ?? 10, 30);
        return {
            count: files.length,
            sessions: files.slice(0, limit).map(f => ({
                date: f.split('-session')[0],
                file: f,
                size: fs.statSync(path.join(LOGS_DIR, f)).size
            }))
        };
    }
};

export default [sessionSearchPlugin, listSessionsPlugin];
