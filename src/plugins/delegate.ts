import https from 'https';
import type { LegionPlugin } from './index';

// delegate.ts — Phase 4 Sub-Agent Delegation
// Spawns a specialist Gemini sub-session via REST API with isolated context.
// The sub-agent gets a focused system prompt, runs to completion, and returns its output.
// This is single-turn (REST generateContent), not a live session.

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? '';
const DELEGATE_MODEL = 'gemini-2.5-flash-preview-04-17'; // Use the thinking model for delegation

const SPECIALIST_PERSONAS: Record<string, string> = {
    coding: `You are an expert software engineer. You write clean, typed, well-documented code. 
You think through edge cases before writing. You prefer correctness over brevity. 
When given a task, deliver working code with a brief explanation.`,

    research: `You are a world-class research analyst. You find, synthesize, and evaluate information 
from multiple angles. You distinguish between strong evidence and speculation. 
You lead with conclusions, then support with evidence. You cite your reasoning clearly.`,

    writing: `You are an expert writer and editor. You write with clarity, precision, and impact. 
You eliminate filler words. You match tone to audience. You structure ideas logically.
You deliver polished prose, not rough drafts.`,

    analysis: `You are a rigorous analytical thinker. You break complex problems into components, 
identify assumptions, evaluate evidence, and form well-reasoned conclusions. 
You use frameworks when helpful but don't hide behind them. Be direct and precise.`,

    planning: `You are a strategic planning expert. You create actionable, realistic plans with 
clear milestones, dependencies, and success criteria. You surface risks proactively. 
You think in systems and second-order effects.`
};

async function runSubAgent(systemPrompt: string, task: string, context?: string): Promise<string> {
    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set.');

    const userContent = context
        ? `Context:\n${context}\n\n---\n\nTask:\n${task}`
        : task;

    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: userContent }] }],
            generationConfig: {
                maxOutputTokens: 4096,
                temperature: 0.3
            }
        });
        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/${DELEGATE_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
                    if (!text) reject(new Error(`No output: ${JSON.stringify(parsed).slice(0, 200)}`));
                    else resolve(text);
                } catch (e: any) { reject(e); }
            });
        });
        req.on('error', reject);
        req.setTimeout(60000, () => { req.destroy(); reject(new Error('Sub-agent timeout')); });
        req.write(body);
        req.end();
    });
}

// ── delegate_task ─────────────────────────────────────────────────────────────
export const delegateTaskPlugin: LegionPlugin = {
    declaration: {
        name: "delegate_task",
        description: "Delegate a complex task to a specialist sub-agent. The sub-agent runs independently with a focused system prompt and returns its result. Use for deep tasks that benefit from isolated context: writing code, deep research, drafting documents, strategic planning.",
        parameters: {
            type: "OBJECT",
            properties: {
                specialist: {
                    type: "STRING",
                    description: "Specialist type: 'coding', 'research', 'writing', 'analysis', or 'planning'"
                },
                task: {
                    type: "STRING",
                    description: "The specific task for the sub-agent to complete"
                },
                context: {
                    type: "STRING",
                    description: "Optional background context to give the sub-agent (docs, code, previous output, etc.)"
                },
                custom_persona: {
                    type: "STRING",
                    description: "Optional custom system prompt to use instead of a preset specialist"
                }
            },
            required: ["task"]
        }
    },
    execute: async (args: any) => {
        if (!args?.task) return { error: "task is required." };
        if (!GEMINI_API_KEY) return { error: "GEMINI_API_KEY not set." };

        const specialist = args.specialist ?? 'analysis';
        const systemPrompt = args.custom_persona ?? SPECIALIST_PERSONAS[specialist] ?? SPECIALIST_PERSONAS.analysis;

        const startTime = Date.now();
        try {
            const result = await runSubAgent(systemPrompt, args.task, args.context);
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            return {
                specialist,
                task: args.task.slice(0, 100) + (args.task.length > 100 ? '...' : ''),
                elapsed_seconds: parseFloat(elapsed),
                result
            };
        } catch (e: any) {
            return { error: `Sub-agent failed: ${e.message}` };
        }
    }
};

// ── list_specialists ──────────────────────────────────────────────────────────
export const listSpecialistsPlugin: LegionPlugin = {
    declaration: {
        name: "list_specialists",
        description: "List available specialist sub-agents for delegation.",
        parameters: { type: "OBJECT", properties: {} }
    },
    execute: async (_args: any) => {
        return {
            model: DELEGATE_MODEL,
            specialists: Object.keys(SPECIALIST_PERSONAS).map(name => ({
                name,
                summary: SPECIALIST_PERSONAS[name].split('\n')[0]
            }))
        };
    }
};

export default [delegateTaskPlugin, listSpecialistsPlugin];
