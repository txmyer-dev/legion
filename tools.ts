import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { manipulateBrowser } from './browser';

const execAsync = promisify(exec);

export const SECURE_ROOT = "C:\\Users\\txmye_ficivtv\\My Drive\\sb";

export function validatePath(requestedPath: string): string {
    // Force use of Windows path resolution logic even on Linux testing box
    const normalized = path.win32.normalize(path.win32.resolve(SECURE_ROOT, requestedPath));
    if (!normalized.startsWith(SECURE_ROOT)) {
        throw new Error("Security Violation: Path traversal outside secure root.");
    }
    return normalized;
}

export async function executeTool(name: string, args: any): Promise<any> {
    try {
        switch (name) {
            case 'get_tasks': {
                const apiKey = process.env.TODOIST_API_KEY;
                if (!apiKey) return { error: "TODOIST_API_KEY not found in environment." };
                
                const response = await fetch("https://api.todoist.com/rest/v2/tasks", {
                    headers: { "Authorization": `Bearer ${apiKey}` }
                });
                
                if (!response.ok) return { error: `Todoist API error: ${response.statusText}` };
                
                const tasks = await response.json() as any[];
                return { 
                    tasks: tasks.map((t: any) => ({
                        id: t.id,
                        content: t.content,
                        description: t.description,
                        is_completed: t.is_completed,
                        due: t.due ? t.due.date : null
                    }))
                };
            }
                
            case 'add_task': {
                const apiKey = process.env.TODOIST_API_KEY;
                if (!apiKey) return { error: "TODOIST_API_KEY not found in environment." };
                if (!args || !args.content) return { error: "Task content required." };
                
                const response = await fetch("https://api.todoist.com/rest/v2/tasks", {
                    method: "POST",
                    headers: { 
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        content: args.content,
                        description: args.description || "",
                        due_string: args.due_string || undefined
                    })
                });
                
                if (!response.ok) return { error: `Todoist API error: ${response.statusText}` };
                
                const task = await response.json() as any;
                return { success: true, task: { id: task.id, content: task.content } };
            }
            case 'read_note': {
                const vaultPath = process.env.OBSIDIAN_VAULT_PATH || "C:\\Users\\txmye_ficivtv\\My Drive\\sb";
                if (!args || !args.path) return { error: "Note path required." };
                const notePath = path.win32.normalize(path.win32.resolve(vaultPath, args.path));
                if (!notePath.startsWith(vaultPath)) return { error: "Security Violation: Path traversal outside vault." };
                
                try {
                    const fs = require('fs/promises');
                    const content = await fs.readFile(notePath, 'utf-8');
                    return { content };
                } catch (e: any) {
                    return { error: `Failed to read note: ${e.message}` };
                }
            }

            case 'append_note': {
                const vaultPath = process.env.OBSIDIAN_VAULT_PATH || "C:\\Users\\txmye_ficivtv\\My Drive\\sb";
                if (!args || !args.path || !args.content) return { error: "Note path and content required." };
                const notePath = path.win32.normalize(path.win32.resolve(vaultPath, args.path));
                if (!notePath.startsWith(vaultPath)) return { error: "Security Violation: Path traversal outside vault." };
                
                try {
                    const fs = require('fs/promises');
                    // Ensure the file ends with a newline before appending if we want, but appending raw is fine.
                    await fs.appendFile(notePath, "\n" + args.content);
                    return { success: true, message: `Appended to ${args.path}` };
                } catch (e: any) {
                    return { error: `Failed to append note: ${e.message}` };
                }
            }
            
            case 'execute_local_command':
                if (args && args.command) {
                    const baseCommand = args.command.split(" ")[0].toLowerCase();
                    const ALLOWED_COMMANDS = ['dir', 'ls', 'echo', 'cat', 'pwd'];
                    
                    if (!ALLOWED_COMMANDS.includes(baseCommand)) {
                        throw new Error(`Security Violation: Command '${baseCommand}' is not allowed.`);
                    }

                    console.log(`Executing bash command: ${args.command}`);
                    const { stdout, stderr } = await execAsync(args.command);
                    return { stdout, stderr };
                }
                throw new Error("Command argument missing.");
                
            case 'manipulate_browser':
                if (args && args.action) {
                    return await manipulateBrowser(args.action, args.url, args.selector, args.value);
                }
                throw new Error("Browser action argument missing.");
                
            default:
                throw new Error(`Unknown function: ${name}`);
        }
    } catch (error: any) {
        console.error(`Error executing tool ${name}:`, error);
        return { error: error.message };
    }
}
