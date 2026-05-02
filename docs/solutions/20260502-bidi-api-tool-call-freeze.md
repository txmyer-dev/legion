---
date: "2026-05-02"
problem_type: "api_integration"
component: "orchestrator"
severity: "critical"
symptoms:
  - "Agent voice output completely freezes after recognizing a user intent that maps to a tool."
  - "No error is thrown; the WebSocket just hangs and stops responding to new voice inputs."
root_cause: "Mismatched object schema between standard REST API function calls and the v1alpha Live Bidi API `toolCall` format."
tags:
  - "gemini-live-api"
  - "websocket"
  - "bidi"
  - "function-calling"
related_issues: []
related_solutions: []
last_referenced: "2026-05-02"
---

# Gemini Live Bidi API Tool Call Freezing

## Problem Statement

**What happened:**
During conversational interactions with the Legion agent, asking the agent to perform an action (e.g., "Check my Todoist tasks") caused the entire system to freeze. The agent would acknowledge the intent implicitly by halting speech, but the expected tool was never executed, and the WebSocket connection became completely unresponsive.

**Impact:**
Total breakdown of the agent's OS integrations. The agent was restricted to conversation-only mode.

## Symptoms

The following symptoms were observed:

1. **Silent Hangs**
   - No errors in standard output or stderr.
   - Incoming microphone frames were still being pushed, but the server yielded no `serverContent`.
   
2. **Missing Function Execution**
   - Expected `console.log` statements inside the tool execution block never fired.

## Investigation Steps

### What Was Tried

> [!TIP]
> Document ALL significant attempts, not just the successful one. Failed approaches help future readers avoid the same dead ends.

| Attempt | Hypothesis | Result |
|---------|------------|--------|
| 1. Debugging `modelTurn.parts` | Assumed the function call payload was nested deeply in the standard `parts` array as per standard REST APIs. | ❌ The array didn't contain `functionCall`. |
| 2. Inspecting the raw WebSocket payload | Assumed the payload format might be slightly different in `v1alpha` Live API. | ✅ Discovered `response.toolCall` at the root of the server payload. |
| 3. Returning generic JSON | Assumed any generic JSON return would satisfy the server. | ❌ The stream remained blocked until an explicit `id` match was provided. |

### Key Discoveries

- Discovery 1: The Bidi WebSocket API `v1alpha` emits tool calls at the root level (`response.toolCall.functionCalls`) instead of nesting them inside `serverContent.modelTurn.parts`.
- Discovery 2: The server suspends all downstream generation until it receives a `ToolResponse` message mapping exactly to the `id` of the function call request.

## Root Cause Analysis

**The actual problem:**
The orchestrator's event loop was checking the wrong object paths for function calls and failing to extract the tool execution request. Furthermore, the previous logic did not capture and return the server-provided `id` parameter. 

**Why it happened:**
We originally patterned our implementation after the standard REST API for Gemini. The newly released `gemini-2.5-flash-native-audio-latest` Multimodal Live API enforces a strict bidirectional locking mechanism during tool calls to prevent race conditions while streaming audio.

## Lessons Learned

> [!IMPORTANT]
> Capture the journey and insights gained. This section helps avoid repeating mistakes.

### Mistakes Made

- **Assumption:** Assuming the `@google/genai` Live WebSocket API shares the exact schema as `generateContent`.
  - **Why it was wrong:** Streaming multimodal APIs require strict interleaving and turn-taking, necessitating top-level control messages like `toolCall`.
  - **Correction:** We must explicitly parse `response.toolCall` independently of `response.serverContent`.

### Key Breakthroughs

- **Insight:** Realizing that the Live API acts like a blocking remote procedure call (RPC) when it needs tool data.
  - **Impact:** We must pass the exact `id` back to the server to unlock the stream.

## Working Solution

### The Fix

```typescript
# File: src/orchestrator.ts
# Lines: 273-290

// 1. Intercept at the root response level
if (response.toolCall) {
    const calls = response.toolCall.functionCalls;
    if (calls) {
        for (const call of calls) {
            const result = await executeTool(call.name, call.args);
            
            // 2. Return the strict FunctionResponse wrapper utilizing the exact call.id
            session.sendToolResponse({
                functionResponses: [{
                    id: call.id,
                    name: call.name,
                    response: result
                }]
            });
        }
    }
}
```

### Explanation

By intercepting the `toolCall` directly off the raw response and iterating through the `functionCalls` array, we correctly extract both the tool `name`, the arguments, and the required `id`. Executing the tool and wrapping the result inside a `session.sendToolResponse()` packet with the matching `id` satisfies the Bidi API's lock, resuming the audio generation seamlessly.

### Verification

```bash
# How to verify the fix worked
bun run start:gateway
# Speak into the microphone: "Check my Todoist tasks."
# The agent should successfully query Todoist and read out the results via audio.
```

## Prevention Strategies

### Immediate Prevention

- [x] Ensure all tool responses strictly pair their payload with a call ID.
- [x] Update documentation warning against generic JSON dumps to the WebSocket.

### Long-term Prevention

- **Pattern to follow:** Treat all Gemini Live API tool executions as synchronous blocking operations.
- **Early detection:** Implement logging inside the websocket `on('message')` loop specifically looking for `response.toolCall` to verify receipt.

## Cross-References

### Related Solutions
- N/A

### External Resources
- [Gemini Multimodal Live API Docs](https://ai.google.dev/api/multimodal-live)

---

*Documented: 2026-05-02*
*Time to resolve: ~4 hours*
