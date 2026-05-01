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
            case 'get_todo_list':
                // For demonstration, we'll return a static list of tasks
                return {
                    tasks: [
                        "develop environment monitoring routine",
                        "update the marketplace",
                        "investigate and fix document processing timeout",
                        "schedule a follow-up meeting"
                    ]
                };
            
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
