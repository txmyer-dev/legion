# Feature: Security Sandbox & Persona Loader

## Context
During the initial build phase of the Legion project, we needed a way to restrict the agent's interaction with the user's host machine (Windows 11) to prevent accidental data loss or security violations. Furthermore, we needed a dynamic way to load the "Ekko" persona into the Gemini Live API `systemInstruction` payload without hardcoding it.

## Implementation Details

### 1. Security Sandbox (`tools.ts`)
We implemented strict security boundaries for local execution.
- **Path Validation:** Using `path.win32.normalize` and `path.win32.resolve`, we check if a requested file path resolves within the explicit `SECURE_ROOT` (`C:\Users\txmye_ficivtv\My Drive\sb`). If it escapes this boundary (e.g., directory traversal `../../Windows`), a `Security Violation` error is thrown.
- **Command Whitelist:** The `execute_local_command` tool parses the base command and ensures it is part of an `ALLOWED_COMMANDS` list (currently `['dir', 'ls', 'echo', 'cat', 'pwd']`). Destructive commands like `rm` are explicitly rejected.

### 2. Persona Loader (`personaLoader.ts`)
Instead of hardcoding instructions in `index.ts`, we created a standalone loader.
- It dynamically reads `personas/{personaName}/CLAUDE.md` and iteratively grabs contextual markdown files from subdirectories like `identity/`, `rules/`, `context/`, and `telos/`.
- This creates a unified string payload that is then sent as the initial `setup` message to the Gemini WebSocket.

### 3. TDD Harness (`tools.test.ts` & `personaLoader.test.ts`)
We leveraged `bun:test` to validate these boundaries locally on the Linux VPS before they are ever executed on Windows.
- 8 passing test cases ensure path resolutions reject traversals and command whitelist functionality is sound.

## Prevention Strategies / Future Considerations
- **Environment Variables:** Currently `SECURE_ROOT` is hardcoded. In the future, this should be an environment variable to support different directories across machines.
- **Async I/O:** The `personaLoader.ts` uses synchronous file I/O (`readFileSync`). This is acceptable at runtime startup but could be moved to async if the payload gets massive.

## Related
- `plans/initial-setup-tdd-integration.md`
- Original PRD boundary requirements in `design/prd.md`
