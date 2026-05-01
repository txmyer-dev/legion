# Tech Stack Preferences

Tony's technology stack, infrastructure, and tool preferences.

## Languages

### Primary
- **TypeScript:** SNAP infrastructure, hooks, CLI tools, skills. All new code defaults to TS.
- **Python:** Transcription (faster-whisper), utility scripts

### Secondary
- **Bash/Zsh:** Hook scripts, automation glue, quick CLI tools
- **Markdown:** Documentation, skills, PRDs

### Avoid
- Java, Ruby — not in the stack, no plans to add

## Runtimes & Package Managers

| Category | Preference | Notes |
|----------|------------|-------|
| JavaScript Runtime | **Bun** | Primary runtime for all tools and hooks |
| Package Manager | **Bun** | `bun install`, `bun run`, `bun test` |
| Python Package Manager | **UV** | Used for faster-whisper and Python utilities |

## Frameworks

- **Hono** — lightweight, runs on Cloudflare Workers
- **Express** — familiar fallback

## Databases

| Type | Preference | Use Case |
|------|------------|----------|
| Document/KV | **Obsidian vault** (markdown files) | Primary knowledge store (local machine) |
| Relational | **PostgreSQL** | When structured data needed |

## Cloud & Infrastructure

### VPS / Self-Hosting
- **Hostinger** — web hosting VPS
- **GCP1** — AI compute (Paperclip, mem0, vector index)
- **Coolify** — container orchestration on Hostinger
- **Philosophy:** Own the server, own the data. Self-host where practical.

### The Ghost CMS Rule
If Tony says "let's build X" and X is something Coolify can deploy in one click, or something that already exists as a mature OSS tool — **say so before writing a single line of code.**

### Hosting Preferences
| Type | Preference |
|------|------------|
| Static Sites | Cloudflare Pages or Coolify |
| APIs/Workers | Cloudflare Workers (Hono) |
| Containers | Coolify on Hostinger VPS |
| CI/CD | GitHub Actions -> Coolify |
| DNS | Cloudflare |

## Development Tools

- **Primary Editor:** Claude Code (CLI-first)
- **Version Control:** Git CLI, feature branches, PR-based workflow
- **Hosting:** GitHub (private repos for SNAP, public for community)

## Libraries

### Always Use
| Category | Library | Why |
|----------|---------|-----|
| Validation | zod | Type-safe, TS-native |
| Testing | vitest or bun test | Fast, TS-native |
| HTTP | fetch (native) | No dependencies needed |
| CLI parsing | commander or yargs | SNAP CLI tools pattern |

### Avoid
| Library | Use Instead | Reason |
|---------|-------------|--------|
| axios | native fetch | Unnecessary dependency |
| moment.js | date-fns | Moment is dead, massive bundle |

## AI & ML

### LLM Providers
- **Primary:** Anthropic (Claude)
- **Secondary:** OpenRouter (for cheap LLM calls)

### AI Infrastructure on GCP1
- **Paperclip** — agent orchestration
- **mem0** — persistent memory (localhost:8000)
- **Ollama** — local embeddings
