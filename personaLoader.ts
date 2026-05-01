import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Loads a persona by name using the OpenClaw structure:
 * - SOUL.md: Identity and personality
 * - TOOLS.md: Capabilities and rules
 * - AGENTS.md: Environmental context
 */
export function loadPersona(personaName: string = 'ekko-project'): string {
    const personaPath = join(process.cwd(), 'personas', personaName);
    
    if (!existsSync(personaPath)) {
        throw new Error(`Persona '${personaName}' not found in ${personaPath}`);
    }

    let systemInstruction = "";

    const readFile = (fileName: string, title: string) => {
        const filePath = join(personaPath, fileName);
        if (existsSync(filePath)) {
            systemInstruction += `### ${title}\n`;
            systemInstruction += readFileSync(filePath, 'utf-8') + "\n\n";
        }
    };

    // Load in specific order
    readFile('SOUL.md', 'Identity & Personality (SOUL)');
    readFile('TOOLS.md', 'Capabilities & Schemas (TOOLS)');
    readFile('AGENTS.md', 'Environmental Context (AGENTS)');

    if (!systemInstruction.trim()) {
        // Fallback default
        return "You are Legion, a highly sophisticated digital assistant. You are witty, slightly sarcastic but deeply loyal and helpful. Keep your responses concise and conversational.";
    }

    return systemInstruction;
}
