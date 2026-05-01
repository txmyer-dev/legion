---
name: Goodbye
description: Session exit protocol. Saves state to mem0 and triggers Catch Me Up via n8n. USE WHEN goodbye, end session, /goodbye, session end, signing off.
version: 1.1.0
---

# Goodbye - Session Exit Protocol

End-of-session skill that captures work state and persists it to mem0.

## When to Use

- User says "goodbye", "end session", "signing off", or `/goodbye`
- Session is approaching context limits
- User is done for the day/night

## Workflow

### Step 1: Capture Session State

Review the current session and build a summary of work completed, decisions made, and next steps.

### Step 2: Persist to mem0

Write the session handoff directly to mem0 for long-term persistence across all infrastructure:

```bash
curl -k -X POST "https://mem0.thecrowbarcrew.cc/v1/memories/" \
     -H "Content-Type: application/json" \
     -H "X-API-Key: 1c3da8d69998beeeb8213f640bfeb9bfee5fe09b17a7935b" \
     -d '{
       "messages": [
         {"role": "user", "content": "Registering session handoff for project: {project-name}"},
         {"role": "assistant", "content": "### In Progress\n{in-progress}\n\n### Decisions\n{decisions}\n\n### Next Steps\n{next-steps}\n\n### Blockers\n{blockers}"}
       ],
       "user_id": "tony"
     }'
```

Determine the project name from the current working directory basename:
- `~/Projects/paperclip` → `paperclip`
- `~` (home directory) → `home`

### Step 3: Update Memory (if applicable)

Check if any **stable patterns** were confirmed during this session that should be saved to MEMORY.md. Only update if:
- A new convention was established
- A recurring problem was solved
- A user preference was expressed
- Infrastructure changed

### Step 4: Todoist Sweep (Safety Net)

Before triggering the webhook, sweep Todoist for tasks that match work completed this session:

1. Review what was accomplished
2. Call `mcp__todoist__find-tasks-by-date` (startDate: 'today', daysCount: 7)
3. Cross-reference: do any open tasks match completed work?
4. If matches found, present them to Tony: "These Todoist tasks look done — want me to close them?"
5. On confirmation, call `mcp__todoist__complete-tasks`

### Step 5: Trigger Catch Me Up

POST the session summary to the n8n webhook:

```bash
curl -k -s -X POST https://n8n.felaniam.cloud/webhook/catch-me-up \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "project": "{project-name}",
    "completed": ["short description of each thing shipped"],
    "handoff": {
      "in_progress": [...],
      "decisions": [...],
      "next_steps": [...],
      "blockers": [...]
    }
  }' > /dev/null 2>&1
```

### Step 6: Confirm and Sign Off

Tell Tony:
- That handoff has been persisted to mem0.
- Whether MEMORY.md was updated.
- That n8n was triggered.
- A brief sign-off message.

## Output Format

```
Session handoff persisted to mem0.
{Memory updated: {what} | Memory: no changes needed}
Dashboard updated via n8n.

{Sign-off message from Ekko}
```

## Notes

- The n8n webhook triggers the full Catch Me Up pipeline: Todoist, VPS health, and session data get combined into the dashboard JSON.
- mem0 is the primary source of truth for session continuity.
- Keep the sign-off brief and human. Not a status report.
