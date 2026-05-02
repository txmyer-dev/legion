import https from 'https';
import type { LegionPlugin } from './index';

// Fabric pattern executor — applies structured analysis patterns to content.
// Patterns are implemented as specialized prompts sent to Gemini REST API.

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? '';
const GEMINI_MODEL = 'gemini-2.0-flash';

const PATTERNS: Record<string, string> = {
    extract_wisdom: `Extract the most valuable wisdom from the following content. Return:
## Key Ideas
- [most important ideas]
## Surprising Facts
- [counterintuitive or little-known facts]
## Actionable Advice
- [concrete things someone could do]
## Mental Models
- [frameworks or ways of thinking introduced]
## Quotes Worth Keeping
- "[quote]" — [source if known]`,

    summarize: `Summarize the following content concisely. Lead with the core thesis. Include key supporting points. Note what was omitted. Format:
## Summary
[2-3 sentence executive summary]
## Key Points
- [point 1]
- [point 2]
## What Was Omitted
[brief note]`,

    analyze_claims: `Break the following content into individual claims. For each claim, assess:
- Is it supported by evidence? (Yes/Partial/No)
- What is the evidence quality? (Strong/Moderate/Weak/None)
- Is it verifiable?
Format as a table.`,

    extract_questions: `Surface the most important questions raised by or about the following content. Categorize as:
## Questions the Content Answers
## Questions the Content Raises But Doesn't Answer
## Questions You Should Ask About This Content`,

    rate_content: `Rate the following content on these dimensions (score 1-10 each, with brief justification):
- **Novelty**: How new or original is this?
- **Depth**: How thoroughly is the topic covered?
- **Actionability**: How useful is this for taking action?
- **Evidence Quality**: How well-supported are the claims?
- **Clarity**: How easy is it to understand?
Overall verdict: [one sentence]`,

    create_tags: `Generate a flat list of relevant tags for the following content. Return 10-20 tags, one per line, lowercase, no #.`,

    first_principles: `Deconstruct the following topic to first principles:
## Core Assumptions
[What must be true for this to work?]
## Fundamental Components
[Break it into irreducible parts]
## What Can Be Questioned
[Which assumptions could be challenged?]
## Rebuilt From Scratch
[How would you reconstruct this from fundamentals?]`
};

async function callGeminiREST(systemPrompt: string, content: string): Promise<string> {
    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set.');
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n---\n\n${content}` }] }],
            generationConfig: { maxOutputTokens: 2048 }
        });
        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
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
                    resolve(text || 'No output from model.');
                } catch { resolve(data); }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

// ── fabric_apply ──────────────────────────────────────────────────────────────
export const fabricApplyPlugin: LegionPlugin = {
    declaration: {
        name: "fabric_apply",
        description: "Apply a Fabric analysis pattern to content. Patterns: extract_wisdom, summarize, analyze_claims, extract_questions, rate_content, create_tags, first_principles.",
        parameters: {
            type: "OBJECT",
            properties: {
                pattern: {
                    type: "STRING",
                    description: "The Fabric pattern to apply: extract_wisdom | summarize | analyze_claims | extract_questions | rate_content | create_tags | first_principles"
                },
                content: {
                    type: "STRING",
                    description: "The content to analyze (article text, transcript, notes, etc.)"
                }
            },
            required: ["pattern", "content"]
        }
    },
    execute: async (args: any) => {
        if (!args?.pattern || !args?.content) return { error: "pattern and content are required." };
        const prompt = PATTERNS[args.pattern];
        if (!prompt) {
            return {
                error: `Unknown pattern "${args.pattern}".`,
                available: Object.keys(PATTERNS)
            };
        }
        try {
            const result = await callGeminiREST(prompt, args.content);
            return { pattern: args.pattern, result };
        } catch (e: any) {
            return { error: e.message };
        }
    }
};

// ── fabric_list_patterns ──────────────────────────────────────────────────────
export const fabricListPatternsPlugin: LegionPlugin = {
    declaration: {
        name: "fabric_list_patterns",
        description: "List all available Fabric analysis patterns.",
        parameters: { type: "OBJECT", properties: {} }
    },
    execute: async (_args: any) => {
        return {
            count: Object.keys(PATTERNS).length,
            patterns: Object.entries(PATTERNS).map(([name, prompt]) => ({
                name,
                summary: prompt.split('\n')[0].slice(0, 80)
            }))
        };
    }
};

export default [fabricApplyPlugin, fabricListPatternsPlugin];
