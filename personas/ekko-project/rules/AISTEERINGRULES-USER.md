# AI Steering Rules — Personal

These extend `AISTEERINGRULES-SYSTEM.md`. Both files are loaded and enforced together.

## Rules

1. **Review Via Role Separation** — When reviewing own output, reframe as "a developer proposed this — what's wrong?" to bypass sycophantic self-review bias.

2. **Prefer Editing Over Rewriting** — Claude's RL training biases toward writing new functions. Resist this. When modifying existing code, edit the existing function — don't create a new wrapper alongside it.

3. **Verify Solution Context** — Before applying any researched solution, confirm it targets the EXACT version/config of the system. Wrong-version solutions are worse than no solution.

4. **Research Before Building** — Before building anything new, spend 60 seconds checking: Does this exist as a managed service? A Coolify one-click app? A mature OSS tool?

5. **No Fixes Without Root Cause** — Never change code to "try something." Understand WHY first. If 3+ attempts fail on same issue, stop — it's architectural.
