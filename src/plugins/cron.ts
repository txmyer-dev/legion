import fs from 'fs';
import path from 'path';
import type { LegionPlugin } from './index';

const CRON_FILE = path.resolve(__dirname, '../../memory/cron.json');

interface CronJob {
    id: string;
    name: string;
    schedule: string;   // cron expression e.g. "0 8 * * *"
    description: string;
    command: string;    // tool name + args JSON to execute
    enabled: boolean;
    lastRun?: string;
    createdAt: string;
}

function loadCrons(): CronJob[] {
    if (!fs.existsSync(CRON_FILE)) return [];
    try { return JSON.parse(fs.readFileSync(CRON_FILE, 'utf-8')); }
    catch { return []; }
}

function saveCrons(jobs: CronJob[]) {
    const dir = path.dirname(CRON_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CRON_FILE, JSON.stringify(jobs, null, 2), 'utf-8');
}

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

// ── cron_add ──────────────────────────────────────────────────────────────────
export const cronAddPlugin: LegionPlugin = {
    declaration: {
        name: "cron_add",
        description: "Schedule a recurring task. Use standard cron expressions (e.g. '0 8 * * *' = daily at 8am). The task will execute a specified tool on schedule.",
        parameters: {
            type: "OBJECT",
            properties: {
                name: {
                    type: "STRING",
                    description: "A short name for this cron job (e.g. 'daily-brief')"
                },
                schedule: {
                    type: "STRING",
                    description: "Cron expression (e.g. '0 8 * * *' for daily 8am, '*/30 * * * *' for every 30 min)"
                },
                description: {
                    type: "STRING",
                    description: "What this job does"
                },
                command: {
                    type: "STRING",
                    description: "Tool name and args to execute as JSON (e.g. '{\"tool\": \"get_weather\", \"args\": {\"city\": \"NYC\"}}')"
                }
            },
            required: ["name", "schedule", "description", "command"]
        }
    },
    execute: async (args: any) => {
        if (!args?.name || !args?.schedule || !args?.command) {
            return { error: "name, schedule, and command are required." };
        }
        const jobs = loadCrons();
        const job: CronJob = {
            id: generateId(),
            name: args.name,
            schedule: args.schedule,
            description: args.description ?? '',
            command: args.command,
            enabled: true,
            createdAt: new Date().toISOString()
        };
        jobs.push(job);
        saveCrons(jobs);
        return { success: true, id: job.id, message: `Cron job "${job.name}" scheduled: ${job.schedule}` };
    }
};

// ── cron_list ─────────────────────────────────────────────────────────────────
export const cronListPlugin: LegionPlugin = {
    declaration: {
        name: "cron_list",
        description: "List all scheduled cron jobs.",
        parameters: {
            type: "OBJECT",
            properties: {}
        }
    },
    execute: async (_args: any) => {
        const jobs = loadCrons();
        if (jobs.length === 0) return { empty: true, message: "No cron jobs scheduled." };
        return {
            count: jobs.length,
            jobs: jobs.map(j => ({
                id: j.id,
                name: j.name,
                schedule: j.schedule,
                description: j.description,
                enabled: j.enabled,
                lastRun: j.lastRun ?? 'never'
            }))
        };
    }
};

// ── cron_remove ───────────────────────────────────────────────────────────────
export const cronRemovePlugin: LegionPlugin = {
    declaration: {
        name: "cron_remove",
        description: "Remove a scheduled cron job by ID. Use cron_list to get IDs.",
        parameters: {
            type: "OBJECT",
            properties: {
                id: {
                    type: "STRING",
                    description: "The cron job ID to remove"
                }
            },
            required: ["id"]
        }
    },
    execute: async (args: any) => {
        if (!args?.id) return { error: "id is required." };
        const jobs = loadCrons();
        const idx = jobs.findIndex(j => j.id === args.id);
        if (idx === -1) return { error: `Cron job "${args.id}" not found.` };
        const removed = jobs.splice(idx, 1)[0];
        saveCrons(jobs);
        return { success: true, removed: removed?.name ?? 'unknown' };

    }
};

// ── cron_toggle ───────────────────────────────────────────────────────────────
export const cronTogglePlugin: LegionPlugin = {
    declaration: {
        name: "cron_toggle",
        description: "Enable or disable a cron job without removing it.",
        parameters: {
            type: "OBJECT",
            properties: {
                id: { type: "STRING", description: "The cron job ID" },
                enabled: { type: "BOOLEAN", description: "true to enable, false to disable" }
            },
            required: ["id", "enabled"]
        }
    },
    execute: async (args: any) => {
        if (!args?.id) return { error: "id is required." };
        const jobs = loadCrons();
        const job = jobs.find(j => j.id === args.id);
        if (!job) return { error: `Cron job "${args.id}" not found.` };
        job.enabled = Boolean(args.enabled);
        saveCrons(jobs);
        return { success: true, id: job.id, name: job.name, enabled: job.enabled };
    }
};

export default [cronAddPlugin, cronListPlugin, cronRemovePlugin, cronTogglePlugin];
