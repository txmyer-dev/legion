import fs from 'fs';
import path from 'path';
import type { LegionPlugin } from './index';

const SKILLS_DIR = path.resolve(__dirname, '../skills');
const REGISTRY_PATH = path.join(SKILLS_DIR, 'registry.json');

interface SkillEntry {
    name: string;
    description: string;
    file: string;
    tier: 'always' | 'deferred';
    triggers: string[];
}

interface SkillRegistry {
    version: string;
    skills: Record<string, SkillEntry>;
}

function loadRegistry(): SkillRegistry {
    return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
}

// ── list_skills ───────────────────────────────────────────────────────────────
export const listSkillsPlugin: LegionPlugin = {
    declaration: {
        name: "list_skills",
        description: "List all available skills Ekko has access to. Skills are knowledge documents that give Ekko specialized expertise.",
        parameters: {
            type: "OBJECT",
            properties: {}
        }
    },
    execute: async (_args: any) => {
        const registry = loadRegistry();
        const skills = Object.entries(registry.skills).map(([id, entry]) => ({
            id,
            name: entry.name,
            description: entry.description,
            tier: entry.tier,
            triggers: entry.triggers
        }));
        return { count: skills.length, skills };
    }
};

// ── read_skill ────────────────────────────────────────────────────────────────
export const readSkillPlugin: LegionPlugin = {
    declaration: {
        name: "read_skill",
        description: "Load a specific skill's full content into context. Use when you need expert guidance on a topic (research methodology, finance, OSINT, etc.).",
        parameters: {
            type: "OBJECT",
            properties: {
                skill_id: {
                    type: "STRING",
                    description: "The skill ID to load (e.g., 'research', 'finance', 'osint', 'fabric', 'redteam', 'council')"
                }
            },
            required: ["skill_id"]
        }
    },
    execute: async (args: any) => {
        if (!args?.skill_id) return { error: "skill_id is required." };
        const registry = loadRegistry();
        const entry = registry.skills[args.skill_id];
        if (!entry) {
            const available = Object.keys(registry.skills).join(', ');
            return { error: `Skill "${args.skill_id}" not found. Available: ${available}` };
        }
        const skillPath = path.join(SKILLS_DIR, entry.file);
        if (!fs.existsSync(skillPath)) {
            return { error: `Skill file for "${args.skill_id}" not found at ${skillPath}` };
        }
        const content = fs.readFileSync(skillPath, 'utf-8');
        return { skill_id: args.skill_id, name: entry.name, content };
    }
};

export default [listSkillsPlugin, readSkillPlugin];
