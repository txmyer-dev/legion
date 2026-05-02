import { promisify } from 'util';
import { exec } from 'child_process';
import path from 'path';
import type { LegionPlugin } from './index';

const execAsync = promisify(exec);

export const executeLocalCommandPlugin: LegionPlugin = {
    declaration: {
        name: "execute_local_command",
        description: "Execute a safe local bash command.",
        parameters: {
            type: "OBJECT",
            properties: {
                command: { type: "STRING" }
            },
            required: ["command"]
        }
    },
    execute: async (args: any) => {
        if (args && args.command) {
            console.log(`Executing bash command in secure sandbox: ${args.command}`);
            try {
                const vaultPath = process.env.OBSIDIAN_VAULT_PATH || "/home/txmyer/sb";
                const dockerCmd = `docker run --rm -v "${vaultPath}:/sandbox:ro" -w /sandbox alpine sh -c "apk add --no-cache curl >/dev/null 2>&1 || true; ${args.command.replace(/"/g, '\\"')}"`;
                
                const { stdout, stderr } = await execAsync(dockerCmd);
                return { stdout, stderr };
            } catch (e: any) {
                return { error: `Command failed in sandbox: ${e.message}` };
            }
        }
        throw new Error("Command argument missing.");
    }
};

export const triggerCompoundWorkflowPlugin: LegionPlugin = {
    declaration: {
        name: "trigger_compound_workflow",
        description: "Trigger a local compound workflow shell script (e.g., compound-dashboard, compound-health).",
        parameters: {
            type: "OBJECT",
            properties: {
                workflow: { type: "STRING", description: "The name of the workflow script without the .sh extension" }
            },
            required: ["workflow"]
        }
    },
    execute: async (args: any) => {
        if (args && args.workflow) {
            const workflowScript = path.resolve(__dirname, '../../scripts', `${args.workflow}.sh`);
            console.log(`Triggering compound workflow: ${workflowScript}`);
            try {
                const { stdout, stderr } = await execAsync(`bash "${workflowScript}"`);
                return { success: true, stdout, stderr };
            } catch (e: any) {
                return { error: `Workflow failed: ${e.message}` };
            }
        }
        throw new Error("Workflow argument missing.");
    }
};

export default [executeLocalCommandPlugin, triggerCompoundWorkflowPlugin];
