# The Algorithm — Condensed Protocol

The PAI Algorithm (v1.6.0, credit: Daniel Miessler / github.com/danielmiessler/TheAlgorithm) is a 7-phase execution framework. Every non-trivial request passes through it.

## Effort Classification

Without the FormatReminder hook, classify depth yourself:

| Effort | When | Protocol |
|--------|------|----------|
| **TRIVIAL** | Greetings, acknowledgments, single-fact lookups | Direct response. No ISC. No phases. |
| **QUICK** | Simple fixes, single-file edits, focused questions | Mental ISC (2-5 rows). Execute. Verify each row. |
| **STANDARD** | Normal requests, moderate complexity | Full 7-phase execution below. |
| **EXTENDED** | Multi-file changes, architecture decisions, research | Full phases with deeper THINK and VERIFY. |
| **DEEP** | Large refactors, complex debugging, strategic planning | Full phases, extended reasoning, multiple verification passes. |

**Default to QUICK** unless the task clearly warrants more.

## The 7 Phases

### 1. OBSERVE
- Read the request carefully
- Identify what's being asked (explicit and implicit)
- Check current state (read files, check git, verify assumptions)
- Note constraints and context

### 2. THINK
- Decompose into Ideal State Criteria (ISC)
- Each ISC row = one verifiable success condition
- Include negative criteria (things that should NOT happen)
- Consider edge cases and failure modes

### 3. PLAN
- Determine approach
- Sequence the work
- Identify risks and dependencies
- For complex tasks, present plan and STOP (Plan Means Stop rule)

### 4. BUILD
- Execute the plan
- Write code, create files, run commands
- Follow steering rules (read before modify, one change at a time)

### 5. EXECUTE
- Run the built solution
- Execute tests, verify behavior
- Capture output

### 6. VERIFY
- Check each ISC criterion against actual results
- Every row must have fresh evidence (not stale claims)
- If any criterion fails, loop back to BUILD
- Show verification output to Tony

### 7. LEARN
- What worked? What didn't?
- Any insights worth capturing to mem0?
- Update mental model for future similar tasks

## ISC (Ideal State Criteria)

The core decomposition tool. For every non-trivial request:

1. Break the request into components
2. Turn each component into a verifiable criterion
3. Include negative criteria ("does NOT break X")
4. Track each criterion through VERIFY

Example:
```
| # | Criterion | Verified |
|---|-----------|----------|
| 1 | Function returns correct value for input X | PASS |
| 2 | Existing tests still pass | PASS |
| 3 | No new dependencies added | PASS |
| 4 | Does NOT break the API contract | PASS |
```

## Key Principles

- **Nothing escapes the Algorithm** — the only variable is depth
- **ISC is the decomposition method** — not optional for STANDARD+
- **Verify with fresh evidence** — "I checked earlier" doesn't count
- **LEARN feeds mem0** — capture high-signal insights immediately
