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
        const apiKey = process.env.TODOIST_API_TOKEN;
        if (!apiKey) return { error: "TODOIST_API_TOKEN not found in environment." };
        
        const response = await fetch("https://api.todoist.com/api/v1/tasks", {
            headers: { "Authorization": `Bearer ${apiKey}` }
        });
        
        if (!response.ok) return { error: `Todoist API error: ${response.statusText}` };
        
        const data = await response.json() as any;
        const tasks = data.results || [];
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
        const apiKey = process.env.TODOIST_API_TOKEN;
        if (!apiKey) return { error: "TODOIST_API_TOKEN not found in environment." };
        if (!args || !args.content) return { error: "Task content required." };
        
        const response = await fetch("https://api.todoist.com/api/v1/tasks", {
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

export const completeTaskPlugin: LegionPlugin = {
    declaration: {
        name: "complete_task",
        description: "Mark a Todoist task as complete.",
        parameters: {
            type: "OBJECT",
            properties: {
                id: { type: "STRING", description: "The ID of the task to complete" }
            },
            required: ["id"]
        }
    },
    execute: async (args: any) => {
        const apiKey = process.env.TODOIST_API_TOKEN;
        if (!apiKey) return { error: "TODOIST_API_TOKEN not found." };
        if (!args || !args.id) return { error: "Task id required." };
        
        const response = await fetch(`https://api.todoist.com/api/v1/tasks/${args.id}/close`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}` }
        });
        if (!response.ok) return { error: `Todoist API error: ${response.statusText}` };
        return { success: true, message: `Task ${args.id} completed.` };
    }
};

export const removeTaskPlugin: LegionPlugin = {
    declaration: {
        name: "remove_task",
        description: "Delete a Todoist task.",
        parameters: {
            type: "OBJECT",
            properties: {
                id: { type: "STRING", description: "The ID of the task to delete" }
            },
            required: ["id"]
        }
    },
    execute: async (args: any) => {
        const apiKey = process.env.TODOIST_API_TOKEN;
        if (!apiKey) return { error: "TODOIST_API_TOKEN not found." };
        if (!args || !args.id) return { error: "Task id required." };
        
        const response = await fetch(`https://api.todoist.com/api/v1/tasks/${args.id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${apiKey}` }
        });
        if (!response.ok) return { error: `Todoist API error: ${response.statusText}` };
        return { success: true, message: `Task ${args.id} deleted.` };
    }
};

export default [getTasksPlugin, addTaskPlugin, completeTaskPlugin, removeTaskPlugin];
