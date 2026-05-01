import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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
                    console.log(`Executing bash command: ${args.command}`);
                    const { stdout, stderr } = await execAsync(args.command);
                    return { stdout, stderr };
                }
                throw new Error("Command argument missing.");
                
            default:
                throw new Error(`Unknown function: ${name}`);
        }
    } catch (error: any) {
        console.error(`Error executing tool ${name}:`, error);
        return { error: error.message };
    }
}
