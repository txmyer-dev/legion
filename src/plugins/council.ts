import https from 'https';
import type { LegionPlugin } from './index';

// Council — multi-agent debate system.
// Spawns N parallel Gemini REST calls, each with a distinct advisor persona,
// then synthesizes their responses into a structured output.

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? '';
const GEMINI_MODEL = 'gemini-2.0-flash';

const DEFAULT_COUNCILS: Record<string, Array<{ role: string; persona: string }>> = {
    business: [
        { role: 'Operator', persona: 'You are a pragmatic operator focused on execution, cashflow, and what actually works in practice. Be direct and skeptical of theory.' },
        { role: 'Investor', persona: 'You are a long-term investor focused on compounding returns, risk-adjusted outcomes, and durable competitive advantages.' },
        { role: 'Customer', persona: 'You are the end customer. You care about your specific problem being solved simply and reliably. You are skeptical of features and marketing.' }
    ],
    technical: [
        { role: 'Architect', persona: 'You are a systems architect focused on long-term scalability, maintainability, and avoiding technical debt.' },
        { role: 'Developer', persona: 'You are a senior developer focused on practical implementation, developer experience, and shipping quickly.' },
        { role: 'Security', persona: 'You are a security engineer. You look for attack surfaces, data leakage, and auth flaws. You are inherently distrustful.' }
    ],
    life: [
        { role: 'Long-term Self', persona: 'You are the person speaking, 10 years from now. You know what mattered and what didn\'t. You are honest about regrets.' },
        { role: 'Trusted Friend', persona: 'You are a trusted, blunt friend who loves the person but will not coddle them. You say what needs to be said.' },
        { role: 'Devil\'s Advocate', persona: 'Your job is to make the strongest possible case for the opposite of whatever seems obvious. Be rigorous.' }
    ],
    default: [
        { role: 'Optimist', persona: 'Make the strongest possible case for why this will succeed or is true. Be constructive and specific.' },
        { role: 'Skeptic', persona: 'Make the strongest possible case for why this will fail or is false. Be rigorous and specific.' },
        { role: 'Pragmatist', persona: 'Focus on concrete next steps, tradeoffs, and what actually matters for implementation. Be direct.' }
    ]
};

async function callAdvisor(role: string, persona: string, question: string): Promise<{ role: string; response: string }> {
    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set.');
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            system_instruction: { parts: [{ text: persona }] },
            contents: [{ role: 'user', parts: [{ text: question }] }],
            generationConfig: { maxOutputTokens: 512 }
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
                    const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response.';
                    resolve({ role, response: text });
                } catch { resolve({ role, response: data }); }
            });
        });
        req.on('error', (e) => reject(e));
        req.write(body);
        req.end();
    });
}

// ── council_convene ───────────────────────────────────────────────────────────
export const councilConvenePlugin: LegionPlugin = {
    declaration: {
        name: "council_convene",
        description: "Convene a council of advisors to debate a question from multiple perspectives simultaneously. Returns each advisor's position plus a synthesis.",
        parameters: {
            type: "OBJECT",
            properties: {
                question: {
                    type: "STRING",
                    description: "The question or decision to put to the council"
                },
                council_type: {
                    type: "STRING",
                    description: "Council type: 'business', 'technical', 'life', or 'default'. Default: 'default'"
                },
                custom_roles: {
                    type: "STRING",
                    description: "Optional JSON array of custom advisor roles: [{\"role\": \"Name\", \"persona\": \"You are...\"}]"
                }
            },
            required: ["question"]
        }
    },
    execute: async (args: any) => {
        if (!args?.question) return { error: "question is required." };
        if (!GEMINI_API_KEY) return { error: "GEMINI_API_KEY not set." };

        let advisors = DEFAULT_COUNCILS[args.council_type ?? 'default'] ?? DEFAULT_COUNCILS.default;

        // Allow custom roles override
        if (args.custom_roles) {
            try {
                advisors = JSON.parse(args.custom_roles);
            } catch {
                return { error: "custom_roles must be valid JSON array of {role, persona} objects." };
            }
        }

        // Call all advisors in parallel
        let positions: { role: string; response: string }[];
        try {
            positions = await Promise.all(
                advisors.map(a => callAdvisor(a.role, a.persona, args.question))
            );
        } catch (e: any) {
            return { error: `Council call failed: ${e.message}` };
        }

        // Build synthesis prompt
        const synthesisInput = positions.map(p => `### ${p.role}\n${p.response}`).join('\n\n');
        const synthesisPrompt = `You have received the following perspectives from a council of advisors on this question:\n"${args.question}"\n\n${synthesisInput}\n\nSynthesize these perspectives into a nuanced conclusion. Acknowledge the strongest points from each. Be direct about what the synthesis recommends.`;

        let synthesis = '';
        try {
            const result = await callAdvisor('Synthesizer', synthesisPrompt, args.question);
            synthesis = result.response;
        } catch {
            synthesis = 'Synthesis unavailable.';
        }

        return {
            question: args.question,
            council_type: args.council_type ?? 'default',
            positions,
            synthesis
        };
    }
};

// ── council_types ─────────────────────────────────────────────────────────────
export const councilTypesPlugin: LegionPlugin = {
    declaration: {
        name: "council_types",
        description: "List available council types and their advisor roles.",
        parameters: { type: "OBJECT", properties: {} }
    },
    execute: async (_args: any) => {
        return {
            types: Object.entries(DEFAULT_COUNCILS).map(([type, advisors]) => ({
                type,
                roles: advisors.map(a => a.role)
            }))
        };
    }
};

export default [councilConvenePlugin, councilTypesPlugin];
