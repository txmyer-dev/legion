import https from 'https';
import type { LegionPlugin } from './index';

const GH_TOKEN = process.env.GITHUB_TOKEN;

function ghRequest(path: string, method = 'GET', body?: any): Promise<any> {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            path,
            method,
            headers: {
                'User-Agent': 'Legion-AI/1.0',
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
                ...(GH_TOKEN ? { 'Authorization': `Bearer ${GH_TOKEN}` } : {})
            }
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch { resolve({ raw: data }); }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

export const ghListIssuesPlugin: LegionPlugin = {
    declaration: {
        name: "gh_list_issues",
        description: "List open GitHub Issues for a repository. repo = 'owner/name'.",
        parameters: {
            type: "OBJECT",
            properties: {
                repo: { type: "STRING", description: "owner/name format e.g. txmyer-dev/legion" },
                state: { type: "STRING", description: "open, closed, or all. Default: open" },
                limit: { type: "NUMBER", description: "Max results, default 10" }
            },
            required: ["repo"]
        }
    },
    execute: async (args: any) => {
        if (!args?.repo) return { error: "repo is required." };
        const state = args.state ?? 'open';
        const limit = Math.min(args.limit ?? 10, 30);
        const data = await ghRequest(`/repos/${args.repo}/issues?state=${state}&per_page=${limit}`);
        if (!Array.isArray(data)) return { error: 'GitHub API error', detail: data };
        return {
            repo: args.repo, count: data.length,
            issues: data.map((i: any) => ({
                number: i.number, title: i.title, state: i.state,
                author: i.user?.login, labels: i.labels?.map((l: any) => l.name) ?? [],
                created: i.created_at, url: i.html_url
            }))
        };
    }
};

export const ghCreateIssuePlugin: LegionPlugin = {
    declaration: {
        name: "gh_create_issue",
        description: "Create a new GitHub Issue. Requires GITHUB_TOKEN env var.",
        parameters: {
            type: "OBJECT",
            properties: {
                repo: { type: "STRING", description: "owner/name format" },
                title: { type: "STRING", description: "Issue title" },
                body: { type: "STRING", description: "Issue body (markdown)" }
            },
            required: ["repo", "title"]
        }
    },
    execute: async (args: any) => {
        if (!GH_TOKEN) return { error: "GITHUB_TOKEN not set." };
        if (!args?.repo || !args?.title) return { error: "repo and title required." };
        const payload: any = { title: args.title };
        if (args.body) payload.body = args.body;
        const data = await ghRequest(`/repos/${args.repo}/issues`, 'POST', payload);
        return data.number
            ? { success: true, number: data.number, url: data.html_url }
            : { error: 'Failed', detail: data };
    }
};

export const ghListPRsPlugin: LegionPlugin = {
    declaration: {
        name: "gh_list_prs",
        description: "List pull requests for a GitHub repository.",
        parameters: {
            type: "OBJECT",
            properties: {
                repo: { type: "STRING", description: "owner/name format" },
                state: { type: "STRING", description: "open, closed, or all. Default: open" }
            },
            required: ["repo"]
        }
    },
    execute: async (args: any) => {
        if (!args?.repo) return { error: "repo is required." };
        const data = await ghRequest(`/repos/${args.repo}/pulls?state=${args.state ?? 'open'}&per_page=10`);
        if (!Array.isArray(data)) return { error: 'GitHub API error', detail: data };
        return {
            repo: args.repo, count: data.length,
            pull_requests: data.map((pr: any) => ({
                number: pr.number, title: pr.title, state: pr.state,
                author: pr.user?.login, branch: pr.head?.ref,
                created: pr.created_at, url: pr.html_url
            }))
        };
    }
};

export const ghGetRepoPlugin: LegionPlugin = {
    declaration: {
        name: "gh_get_repo",
        description: "Get metadata for a GitHub repository.",
        parameters: {
            type: "OBJECT",
            properties: {
                repo: { type: "STRING", description: "owner/name format" }
            },
            required: ["repo"]
        }
    },
    execute: async (args: any) => {
        if (!args?.repo) return { error: "repo is required." };
        const data = await ghRequest(`/repos/${args.repo}`);
        if (!data.full_name) return { error: 'Not found', detail: data };
        return {
            name: data.full_name, description: data.description,
            stars: data.stargazers_count, forks: data.forks_count,
            language: data.language, open_issues: data.open_issues_count,
            default_branch: data.default_branch, updated: data.updated_at, url: data.html_url
        };
    }
};

export default [ghListIssuesPlugin, ghCreateIssuePlugin, ghListPRsPlugin, ghGetRepoPlugin];
