import fs from 'fs';
import path from 'path';

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

export class SkillLoader {
    private registry: SkillRegistry;
    private skillsDir: string;

    constructor() {
        this.skillsDir = path.resolve(__dirname, '../skills');
        const registryPath = path.join(this.skillsDir, 'registry.json');
        try {
            this.registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
        } catch {
            this.registry = { version: '1.0.0', skills: {} };
        }
    }

    /**
     * Load all `tier: "always"` skills — injected into every session system prompt.
     */
    loadAlwaysSkills(): string {
        const blocks = Object.values(this.registry.skills)
            .filter(s => s.tier === 'always')
            .map(s => this.readSkillFile(s.file))
            .filter(Boolean);

        if (blocks.length === 0) return '';
        return `\n\n---\n\n## Loaded Skills\n\n${blocks.join('\n\n---\n\n')}`;
    }

    /**
     * Load deferred skills triggered by the user's message.
     * Called per-turn before sending to the model.
     */
    loadTriggeredSkills(userMessage: string): string {
        const lower = userMessage.toLowerCase();
        const blocks = Object.values(this.registry.skills)
            .filter(s => s.tier === 'deferred' && s.triggers.some(t => lower.includes(t)))
            .map(s => this.readSkillFile(s.file))
            .filter(Boolean);

        return blocks.join('\n\n---\n\n');
    }

    /**
     * Load a skill by ID (for the read_skill tool).
     */
    loadSkill(id: string): string | null {
        const entry = this.registry.skills[id];
        if (!entry) return null;
        return this.readSkillFile(entry.file);
    }

    /**
     * List all skills in the registry.
     */
    listSkills(): Array<SkillEntry & { id: string }> {
        return Object.entries(this.registry.skills).map(([id, entry]) => ({ id, ...entry }));
    }

    private readSkillFile(filename: string): string {
        const filePath = path.join(this.skillsDir, filename);
        if (!fs.existsSync(filePath)) return '';
        return fs.readFileSync(filePath, 'utf-8');
    }
}

export const skillLoader = new SkillLoader();
