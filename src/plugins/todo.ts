import type { LegionPlugin } from './index';

// In-session task list — lives in memory for the current session only.
// For persistence across sessions, use write_memory with section "Todo".

interface Task {
    id: number;
    text: string;
    done: boolean;
    created: string;
}

const sessionTasks: Task[] = [];
let nextId = 1;

// ── add_todo ──────────────────────────────────────────────────────────────────
export const addTodoPlugin: LegionPlugin = {
    declaration: {
        name: "add_todo",
        description: "Add a task to the current session's to-do list. Use this when the user asks you to track something, remember a step, or plan multi-part work.",
        parameters: {
            type: "OBJECT",
            properties: {
                task: {
                    type: "STRING",
                    description: "The task description to add"
                }
            },
            required: ["task"]
        }
    },
    execute: async (args: any) => {
        if (!args?.task) return { error: "task is required." };
        const entry: Task = {
            id: nextId++,
            text: args.task.trim(),
            done: false,
            created: new Date().toISOString()
        };
        sessionTasks.push(entry);
        return { success: true, id: entry.id, task: entry.text };
    }
};

// ── list_todos ────────────────────────────────────────────────────────────────
export const listTodosPlugin: LegionPlugin = {
    declaration: {
        name: "list_todos",
        description: "List all tasks in the current session. Shows pending and completed tasks.",
        parameters: {
            type: "OBJECT",
            properties: {
                filter: {
                    type: "STRING",
                    description: "Optional filter: 'pending', 'done', or 'all'. Default: 'all'"
                }
            }
        }
    },
    execute: async (args: any) => {
        const filter = args?.filter ?? 'all';
        let tasks = sessionTasks;
        if (filter === 'pending') tasks = sessionTasks.filter(t => !t.done);
        if (filter === 'done') tasks = sessionTasks.filter(t => t.done);

        if (tasks.length === 0) return { empty: true, message: "No tasks found." };
        return {
            total: tasks.length,
            pending: sessionTasks.filter(t => !t.done).length,
            completed: sessionTasks.filter(t => t.done).length,
            tasks
        };
    }
};

// ── complete_todo ─────────────────────────────────────────────────────────────
export const completeTodoPlugin: LegionPlugin = {
    declaration: {
        name: "complete_todo",
        description: "Mark a task as done by its ID. Use list_todos to get task IDs.",
        parameters: {
            type: "OBJECT",
            properties: {
                id: {
                    type: "NUMBER",
                    description: "The task ID to mark as complete"
                }
            },
            required: ["id"]
        }
    },
    execute: async (args: any) => {
        if (!args?.id) return { error: "id is required." };
        const task = sessionTasks.find(t => t.id === Number(args.id));
        if (!task) return { error: `Task #${args.id} not found.` };
        task.done = true;
        return { success: true, id: task.id, task: task.text };
    }
};

// ── remove_todo ───────────────────────────────────────────────────────────────
export const removeTodoPlugin: LegionPlugin = {
    declaration: {
        name: "remove_todo",
        description: "Remove a task from the list by its ID.",
        parameters: {
            type: "OBJECT",
            properties: {
                id: {
                    type: "NUMBER",
                    description: "The task ID to remove"
                }
            },
            required: ["id"]
        }
    },
    execute: async (args: any) => {
        if (!args?.id) return { error: "id is required." };
        const idx = sessionTasks.findIndex(t => t.id === Number(args.id));
        if (idx === -1) return { error: `Task #${args.id} not found.` };
        const removed = sessionTasks.splice(idx, 1)[0];
        return { success: true, removed: removed?.text ?? 'unknown' };
    }
};

export default [addTodoPlugin, listTodosPlugin, completeTodoPlugin, removeTodoPlugin];
