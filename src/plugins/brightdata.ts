import https from 'https';
import http from 'http';
import type { LegionPlugin } from './index';

const BRIGHTDATA_API_KEY = process.env.BRIGHTDATA_API_KEY ?? '';

// Progressive scraping with 3 fallback tiers:
// Tier 1: Native fetch (free, works for most public pages)
// Tier 2: BrightData Scraping Browser (paid, handles JS-heavy sites)
// Tier 3: BrightData SERP API (for search results)

function fetchTier1(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const mod = url.startsWith('https') ? https : http;
        const req = mod.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Legion-AI/1.0)',
                'Accept': 'text/html,application/json'
            }
        }, (res) => {
            if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return resolve(fetchTier1(res.headers.location));
            }
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        });
        req.on('error', reject);
        req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
    });
}

function fetchBrightData(url: string, zone: string): Promise<string> {
    if (!BRIGHTDATA_API_KEY) throw new Error('BRIGHTDATA_API_KEY not set');
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({ url, zone });
        const options = {
            hostname: 'api.brightdata.com',
            path: '/request',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${BRIGHTDATA_API_KEY}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

function stripHtml(html: string): string {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim()
        .slice(0, 6000); // cap at 6KB to stay under tool response limit
}

// ── scrape_url ────────────────────────────────────────────────────────────────
export const scrapeUrlPlugin: LegionPlugin = {
    declaration: {
        name: "scrape_url",
        description: "Scrape content from a URL with progressive fallback: tries direct fetch first, then BrightData if the page is JS-heavy or blocked. Returns cleaned text content.",
        parameters: {
            type: "OBJECT",
            properties: {
                url: {
                    type: "STRING",
                    description: "The URL to scrape"
                },
                tier: {
                    type: "STRING",
                    description: "Force a scraping tier: 'auto' (default), 'direct', or 'brightdata'"
                },
                raw: {
                    type: "BOOLEAN",
                    description: "Return raw HTML instead of stripped text. Default: false"
                }
            },
            required: ["url"]
        }
    },
    execute: async (args: any) => {
        if (!args?.url) return { error: "url is required." };
        const url: string = args.url;
        const tier: string = args.tier ?? 'auto';
        const raw: boolean = args.raw ?? false;

        let html = '';
        let usedTier = '';

        try {
            if (tier === 'brightdata' && BRIGHTDATA_API_KEY) {
                html = await fetchBrightData(url, 'scraping_browser');
                usedTier = 'brightdata';
            } else {
                // Tier 1 — direct
                html = await fetchTier1(url);
                usedTier = 'direct';

                // Auto-escalate if we got a bot-detection page
                if (tier === 'auto' && BRIGHTDATA_API_KEY &&
                    (html.includes('captcha') || html.includes('Access Denied') || html.length < 200)) {
                    html = await fetchBrightData(url, 'scraping_browser');
                    usedTier = 'brightdata-fallback';
                }
            }
        } catch (e: any) {
            // Last resort — try BrightData if direct failed
            if (usedTier === 'direct' && BRIGHTDATA_API_KEY) {
                try {
                    html = await fetchBrightData(url, 'scraping_browser');
                    usedTier = 'brightdata-emergency-fallback';
                } catch {
                    return { error: `All scraping tiers failed: ${e.message}` };
                }
            } else {
                return { error: `Scraping failed: ${e.message}` };
            }
        }

        const content = raw ? html.slice(0, 8000) : stripHtml(html);
        return { url, tier_used: usedTier, length: content.length, content };
    }
};

// ── scrape_search ─────────────────────────────────────────────────────────────
export const scrapeSearchPlugin: LegionPlugin = {
    declaration: {
        name: "scrape_search",
        description: "Search Google and return the top result URLs and snippets using BrightData SERP API. Requires BRIGHTDATA_API_KEY.",
        parameters: {
            type: "OBJECT",
            properties: {
                query: {
                    type: "STRING",
                    description: "The search query"
                },
                limit: {
                    type: "NUMBER",
                    description: "Number of results to return. Default: 5"
                }
            },
            required: ["query"]
        }
    },
    execute: async (args: any) => {
        if (!args?.query) return { error: "query is required." };
        if (!BRIGHTDATA_API_KEY) return { error: "BRIGHTDATA_API_KEY not set. Cannot use SERP scraping." };
        try {
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(args.query)}&num=${args.limit ?? 5}`;
            const html = await fetchBrightData(searchUrl, 'serp');
            // BrightData SERP returns structured JSON for search results
            try {
                const parsed = JSON.parse(html);
                return { query: args.query, results: parsed };
            } catch {
                // If not JSON, strip and return
                return { query: args.query, raw: stripHtml(html) };
            }
        } catch (e: any) {
            return { error: `SERP scraping failed: ${e.message}` };
        }
    }
};

export default [scrapeUrlPlugin, scrapeSearchPlugin];
