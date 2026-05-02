import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { manipulateBrowser } from './browser';
import { manageCalendar } from './calendar';

const execAsync = promisify(exec);

export const SECURE_ROOT = "/home/txmyer/sb";

export function validatePath(requestedPath: string): string {
    // Force use of POSIX path resolution logic for the Linux VPS
    const normalized = path.normalize(path.resolve(SECURE_ROOT, requestedPath));
    if (!normalized.startsWith(SECURE_ROOT + path.sep) && normalized !== SECURE_ROOT) {
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
                const vaultPath = process.env.OBSIDIAN_VAULT_PATH || "/home/txmyer/sb";
                if (!args || !args.path) return { error: "Note path required." };
                const notePath = path.normalize(path.resolve(vaultPath, args.path));
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
                const vaultPath = process.env.OBSIDIAN_VAULT_PATH || "/home/txmyer/sb";
                if (!args || !args.path || !args.content) return { error: "Note path and content required." };
                const notePath = path.normalize(path.resolve(vaultPath, args.path));
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
                    console.log(`Executing bash command in secure sandbox: ${args.command}`);
                    try {
                        // Use Docker-based isolation for advanced sandboxing
                        // Mount the secure root read-only, or run purely isolated
                        const vaultPath = process.env.OBSIDIAN_VAULT_PATH || "/home/txmyer/sb";
                        
                        // We use an alpine container that destroys itself after running the command
                        // This prevents any destructive path traversal or local environment corruption.
                        const dockerCmd = `docker run --rm -v "${vaultPath}:/sandbox:ro" -w /sandbox alpine sh -c "apk add --no-cache curl >/dev/null 2>&1 || true; ${args.command.replace(/"/g, '\\"')}"`;
                        
                        const { stdout, stderr } = await execAsync(dockerCmd);
                        return { stdout, stderr };
                    } catch (e: any) {
                        return { error: `Command failed in sandbox: ${e.message}` };
                    }
                }
                throw new Error("Command argument missing.");

            case 'get_weather': {
                const location = args && args.location ? args.location : "";
                try {
                    const { stdout } = await execAsync(`curl -s "wttr.in/${location}?format=3"`);
                    return { weather: stdout.trim() };
                } catch (e: any) {
                    return { error: `Failed to fetch weather: ${e.message}` };
                }
            }
                
                
            case 'trigger_compound_workflow':
                if (args && args.workflow) {
                    const workflowScript = path.resolve(__dirname, '../scripts', `${args.workflow}.sh`);
                    console.log(`Triggering compound workflow: ${workflowScript}`);
                    try {
                        const { stdout, stderr } = await execAsync(`bash "${workflowScript}"`);
                        return { success: true, stdout, stderr };
                    } catch (e: any) {
                        return { error: `Workflow failed: ${e.message}` };
                    }
                }
                throw new Error("Workflow argument missing.");
                
            case 'manipulate_browser':
                if (args && args.action) {
                    return await manipulateBrowser(args.action, args.url, args.selector, args.value);
                }
                throw new Error("Browser action argument missing.");

            case 'manage_calendar':
                if (args && args.action) {
                    return await manageCalendar(args.action, args);
                }
                throw new Error("Calendar action argument missing.");

            case 'generate_image': {
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
                
            default:
                throw new Error(`Unknown function: ${name}`);
        }
    } catch (error: any) {
        console.error(`Error executing tool ${name}:`, error);
        return { error: error.message };
    }
}
