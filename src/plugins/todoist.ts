import type { LegionPlugin } from './index';

export const getTasksPlugin: LegionPlugin = {
    declaration: {
        name: "get_tasks",
        description: "Fetch the user's open tasks from Todoist.",
        parameters: {
            type: "OBJECT",
            properties: {}
        }
    },
    execute: async (args: any) => {
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
};

export const addTaskPlugin: LegionPlugin = {
    declaration: {
        name: "add_task",
        description: "Add a new task to Todoist.",
        parameters: {
            type: "OBJECT",
            properties: {
                content: { type: "STRING", description: "The task name/content" },
                description: { type: "STRING", description: "Optional description" },
                due_string: { type: "STRING", description: "Optional due date like 'tomorrow at 12pm'" }
            },
            required: ["content"]
        }
    },
    execute: async (args: any) => {
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
};

export default [getTasksPlugin, addTaskPlugin];
