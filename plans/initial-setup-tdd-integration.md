# Initial Setup and TDD Integration

> Created: 2026-05-01
> Status: Draft

## Summary
This plan details the process for transitioning the scaffolded Legion architecture into a robust, Test-Driven Development (TDD) environment specifically targeting the Windows 11 context. It focuses on isolating the Tool Dispatcher from the network layer, establishing the Windows security sandbox, and implementing a Hardware Abstraction Layer for Windows-native audio.

## Problem Statement
The current prototype is functional in a Linux-oriented environment but relies on `sox`/`alsa` for audio and lacks a rigorous testing methodology. Without a strong TDD harness, developing the complex state machine for real-time multimodal interactions (WebSocket lifecycles, sub-second latency, tool dispatching) will become fragile and difficult to maintain. Additionally, the agent needs a secure sandbox to safely execute local commands on Windows.

## Research Findings

### Codebase Patterns
- `tools.ts`: Contains the `execute_local_command` stub that currently lacks boundary enforcement.
- `index.ts`: Orchestrates the `BidiGenerateContent` WebSocket connection and audio stream, which currently uses `node-record-lpcm16` assuming a Linux backend.

### Best Practices
- **Pattern #9: Rigorous Planning:** Implement the security boundaries and tests before connecting to the live API to save costs and prevent destructive OS commands.
- **Pattern #10: Atomic State Transitions:** Ensure the WebSocket connection states (connecting, connected, processing, disconnected) are handled atomically.
- **Hardware Abstraction:** Using a strategy pattern for hardware interaction allows us to mock the microphone/speaker for unit tests and seamlessly swap Linux/Windows audio backends.

## Proposed Solution

### Approach
1. **TDD Infrastructure Setup:** Configure `bun:test` or `vitest` to support mocking the Gemini Live API WebSocket stream. This allows the tool dispatch logic and orchestrator to be tested without making actual network requests or incurring API costs.
2. **Security Sandbox Implementation:** Update `tools.ts` to enforce a strict execution and read/write boundary limited to `C:\Users\txmye_ficivtv\My Drive\sb`.
3. **Hardware Abstraction Layer (HAL):** Refactor the audio/video ingestion layer. Abstract `node-record-lpcm16` and the `speaker` package behind a generic interface so that Windows-native alternatives (or mocks) can be injected.
4. **Persona Integration Engine:** Develop a loader that reads the 5ekko persona definitions from the `/personas` directory and formats them into the `systemInstruction` format required by the Gemini API setup payload.

### Code Examples
```typescript
// Example Sandbox Validation in tools.ts
import { resolve, normalize } from "path";

const SECURE_ROOT = "C:\\Users\\txmye_ficivtv\\My Drive\\sb";

export function validatePath(requestedPath: string): string {
    const normalized = normalize(resolve(SECURE_ROOT, requestedPath));
    if (!normalized.startsWith(SECURE_ROOT)) {
        throw new Error("Security Violation: Path traversal outside secure root.");
    }
    return normalized;
}
```

## Acceptance Criteria
- [x] `bun test` runs a comprehensive suite against `tools.ts` without hitting the live Gemini API.
- [x] Attempting to execute commands or read files outside `C:\Users\txmye_ficivtv\My Drive\sb` throws a security violation error.
- [ ] The audio capture and playback mechanics are decoupled into a `HardwareInterface` that can be swapped during testing.
- [x] The system correctly reads a persona configuration from `/personas/ekko-project/` and injects it into the WebSocket setup message.

## Technical Considerations

### Dependencies
- `bun:test` (built-in) or `vitest`.
- Potential Windows audio packages if `node-record-lpcm16` fails natively (e.g., `naudiodon` or `node-core-audio`).

### Risks
- Windows audio streaming via Node.js can suffer from driver-level latency or access issues.
- Ensuring the sandbox is completely bulletproof against path traversal attacks.

### Alternatives Considered
- *Python Backend:* Moving the audio/websocket logic to Python where `PyAudio` is natively more robust on Windows. Rejected for now to maintain the unified TS/Bun stack.

## Implementation Steps

**Approach:**
- [x] Task 1: Setup the `bun:test` test harness and write the first failing tests for the `tools.ts` sandbox.
- [x] Task 2: Implement the `validatePath` and execution boundary logic to pass the sandbox tests.
- [ ] Task 3: Refactor the `index.ts` audio initialization into a `HardwareAbstractionLayer` class. (To be done locally on Windows)
- [x] Task 4: Implement the Persona Loader to read from `/personas` and format the API setup payload.

## References
- [PRD](../design/prd.md)
- [Antigravity Critical Patterns](../docs/solutions/patterns/critical-patterns.md)
