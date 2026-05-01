import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

/**
 * Loads a persona by name.
 * Reads the CLAUDE.md file as the primary system instruction.
 * Can optionally read context, identity, and rules directories.
 */
export function loadPersona(personaName: string = 'ekko-project'): string {
    const personaPath = join(process.cwd(), 'personas', personaName);
    
    if (!existsSync(personaPath)) {
        throw new Error(`Persona '${personaName}' not found in ${personaPath}`);
    }

    let systemInstruction = "";

    // 1. Read main CLAUDE.md
    const mainFile = join(personaPath, 'CLAUDE.md');
    if (existsSync(mainFile)) {
        systemInstruction += readFileSync(mainFile, 'utf-8') + "\n\n";
    }

    // 2. Helper to read directories
    const appendDirContents = (dirName: string, title: string) => {
        const dirPath = join(personaPath, dirName);
        if (existsSync(dirPath)) {
            systemInstruction += `### ${title}\n`;
            const files = readdirSync(dirPath).filter(f => f.endsWith('.md'));
            for (const file of files) {
                const content = readFileSync(join(dirPath, file), 'utf-8');
                systemInstruction += `#### ${file}\n${content}\n\n`;
            }
        }
    };

    appendDirContents('identity', 'Identity Context');
    appendDirContents('rules', 'Rules');
    appendDirContents('context', 'General Context');
    appendDirContents('telos', 'Telos Goals');

    if (!systemInstruction.trim()) {
        // Fallback default
        return "You are Legion, a highly sophisticated digital assistant. You are witty, slightly sarcastic but deeply loyal and helpful. Keep your responses concise and conversational.";
    }

    // Because Gemini system instruction is a single string, we just return the concatenated text.
    // If it gets too large, we might need to truncate or pick the most important parts.
    return systemInstruction;
}
