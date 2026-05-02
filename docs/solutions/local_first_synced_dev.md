# The Local-First Synced Dev Environment

## The Concept
Treating a synced Obsidian vault (via Syncthing or similar engines) as a shared volume between your local laptop and a remote VPS creates a **real-time dev environment**. This architecture gives you the speed and comfort of local editing combined with the raw compute power and always-on availability of your remote VPS agents.

## Why This Wins for Agentic Workflows
* **Almost-Instant Hot-Reloading:** Because updates sync in milliseconds, an autonomous agent on your VPS can be writing code or documentation, and you can have an Obsidian tab open on your laptop that visually hot-reloads the second the agent finishes a thought.
* **Vibe Coding Ready:** By keeping the [Obsidian Local REST API](https://coddingtonbear.github.io/obsidian-local-rest-api/) active, your local scripts or UI tools can interact with the exact same files the agent is modifying on the other end, creating a seamless human-AI feedback loop.

## The "Clean Dev" Strategy: Managing Bloat
When developing code directly inside a synced knowledge base, dependency folders like `node_modules` are your biggest enemy. They contain thousands of tiny files that will choke sync engines and heavily degrade Obsidian's indexing performance.

### 1. Selective Syncing (`.stignore`)
If you are using Syncthing, immediately add `node_modules`, `dist`, and `.next` (or equivalent build folders) to your `.stignore` file. 
* This ensures your source code syncs instantly, but the heavy dependencies stay isolated to their respective hardware. 
* *Note:* You must run `bun install` or `npm install` independently on both the VPS and the laptop.

### 2. Obsidian "Excluded Files"
Ensure `node_modules`, `.git`, and build directories are explicitly added to the **Excluded Files** list in your Obsidian settings (Settings > Files & Links > Excluded files). 
* This stops Obsidian from attempting to parse and index third-party library code as if they were personal notes, keeping the editor interface lightning fast and your search results clean.
