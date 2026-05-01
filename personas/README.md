# Ekko Essentials

Standalone Ekko identity package for GCP1. Deploy to get the full Ekko experience when running `claude` on the server.

## Quick Deploy

```bash
# From local machine:
scp -r ~/My\ Drive/Ekko/ekko-project gcp1:~/ekko/
scp ~/My\ Drive/Ekko/global/CLAUDE.md gcp1:~/.claude/CLAUDE.md

# On GCP1:
echo 'alias ekko="cd ~/ekko && claude"' >> ~/.bashrc
source ~/.bashrc
```

## Usage

```bash
# Get Ekko:
cd ~/ekko && claude
# or just:
ekko

# Paperclip agents still get neutral global CLAUDE.md (no Ekko personality)
```

## Package Structure

```
Ekko/
  README.md                     ← This file
  deploy.sh                     ← Automated deployment script
  ekko-project/                 ← The ~/ekko/ directory for GCP1
    CLAUDE.md                   ← Main Ekko identity (project-level)
    identity/
      KAI.md                    ← Soul file
      DAIDENTITY.md             ← Behavioral rules
    rules/
      AISTEERINGRULES-SYSTEM.md ← System steering rules
      AISTEERINGRULES-USER.md   ← Personal steering rules
    context/
      TECHSTACK.md              ← Tech stack preferences
      ALGORITHM.md              ← Condensed Algorithm protocol
      RESPONSEFORMAT.md         ← Response formatting
    telos/
      *.md                      ← All TELOS files (19 files)
  global/
    CLAUDE.md                   ← Updated neutral global CLAUDE.md
```

## What's Included

- Full Ekko identity (soul, personality, values, learnings)
- Algorithm execution protocol (condensed, no hook dependency)
- Steering rules (system + personal)
- TELOS life context (19 files)
- Tech stack preferences (adapted for Linux)
- mem0 integration (localhost:8000)

## What's NOT Included

- Voice/TTS (dropped by design)
- Hooks (require local TypeScript infrastructure)
- Skills (require skill-index.json routing)
- Fabric patterns (require commands/ directory)
- Desktop MCP servers (Obsidian, Chrome, Todoist)
- Memory files (machine-specific state)
