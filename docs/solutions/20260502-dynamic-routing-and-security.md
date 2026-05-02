---
date: "2026-05-02"
problem_type: "architecture_and_security"
component: "gui_and_tools"
severity: "medium"
symptoms:
  - "Node IP configuration was hardcoded, requiring codebase edits to switch environments."
  - "Security sandbox allowed potential sibling directory traversal via missing trailing slash validation."
root_cause: "MVP architectural debt and incomplete path substring matching."
tags:
  - "electron"
  - "ipc"
  - "security"
  - "path-traversal"
related_issues: []
related_solutions: []
last_referenced: "2026-05-02"
---

# Dynamic Gateway Routing & Path Sandbox Hardening

## Problem Statement

**What happened:**
1. The Windows Node daemon had its Gateway WebSocket URL hardcoded to `ws://localhost:9090`. Moving the Gateway to a remote Linux VPS required changing the source code.
2. The `validatePath` security function in `src/tools.ts` used `startsWith(SECURE_ROOT)`, which inadvertently allowed access to sibling directories sharing the same prefix (e.g., `/home/txmyer/sbad` matched `/home/txmyer/sb`).

**Impact:**
- Severe usability friction for deploying the system.
- Potential sandbox escape allowing the LLM to write/read unintended directories.

## Symptoms

1. **Usability:** Users forced to modify `node.ts` to reconnect their agents.
2. **Security:** Running `validatePath("/home/txmyer/sbad")` would incorrectly return true.

## Investigation Steps

### What Was Tried

| Attempt | Hypothesis | Result |
|---------|------------|--------|
| 1. Dynamic Restart | Try to simply call `startNode()` again with a new URL. | ❌ `ws.on('close')` had a hardcoded `process.exit(0)` killing the Electron app entirely. |
| 2. Path Normalization | Use `path.resolve()` | ✅ Normalizes `../` but doesn't solve the string prefix collision. |

### Key Discoveries

- Discovery 1: Electron's background daemon capability relies on bypassing standard Node exit sequences. We needed to decouple the websocket close event from the process lifecycle.
- Discovery 2: Appending `path.sep` to the `SECURE_ROOT` explicitly bounds the validation to a directory structure.

## Root Cause Analysis

**The actual problem:**
Architectural debt from Phase 1 where the Node script was assumed to be a standalone CLI tool rather than an embedded Electron daemon.

## Working Solution

### The Fix

**1. Dynamic IPC Routing:**
Created an Electron IPC bridge connecting a frontend `settings.html` form to the main process. Removed `process.exit(0)` from the Node and returned a `stop()` closure allowing graceful teardowns.

**2. Sandbox Hardening:**
```typescript
// Enforces exact directory matching
if (!normalized.startsWith(SECURE_ROOT + path.sep) && normalized !== SECURE_ROOT) {
    throw new Error("Security Violation: Path traversal outside secure root.");
}
```

## Prevention Strategies

### Immediate Prevention

- [x] Node exports a proper lifecycle teardown function.
- [x] Path boundary validation explicitly requires the system separator.

### Long-term Prevention

- **Pattern to follow:** Never use raw `.startsWith()` for path boundary assertions without appending the directory separator.

---

*Documented: 2026-05-02*
*Time to resolve: 1 hour*
