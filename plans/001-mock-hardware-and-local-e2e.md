# Mock Hardware Integration & Local End-to-End Testing

> Created: 2026-05-01
> Status: Draft

## Summary
Before advancing to Persona development, we need to ensure the system is fully operational on the local machine. This involves resolving native audio dependencies on Windows (like the missing `sox` package), configuring the environment (API keys), and expanding the `MockHardwareLayer` to allow graceful fallbacks and robust interaction testing when real hardware is unavailable.

## Problem Statement
The user requires a fully tested, working installation of Legion on their local computer. Currently, the application fails to start due to missing environment variables (`GEMINI_API_KEY`) and will inevitably crash or hang on Windows due to `node-record-lpcm16` requiring `sox` for microphone access. We must bridge the gap between our abstract orchestrator and the physical reality of the host machine.

## Research Findings

### Codebase Patterns
- `hardware.ts`: Contains `PlatformHardwareLayer` which uses `speaker` and `node-record-lpcm16`.
- `index.ts`: Instantiates `NodeHardwareLayer` by default. Fails early if `.env` is absent.

### Best Practices
- **Audio on Windows**: `node-record-lpcm16` defaults to `sox`. We need to either install `sox` or configure the recorder to use an alternative (like `rec` or Windows-native alternatives).
- **Environment config**: `.env` is required but not populated.

## Proposed Solution

### Approach
1. **Environment Setup:** Create the `.env` file and instruct the user to provide the Gemini API key.
2. **Hardware Resolution (Windows):** Install `sox` via a package manager (e.g., winget, scoop, or choco) so `node-record-lpcm16` can interface with the microphone.
3. **Mock Hardware Integration:** Expand `MockHardwareLayer` so that if `sox` is unavailable, we can start the system in a "Mock Mode" for development/testing without crashing.
4. **End-to-End Test:** Run the system and verify the WebSocket connects to Gemini, accepts voice input (or mocked input), and plays back the audio response.

## Acceptance Criteria
- [ ] Application starts successfully with `bun index.ts`.
- [ ] Application connects to the Gemini WebSocket.
- [ ] Application can capture audio from the local microphone.
- [ ] Application plays audio responses via the system speakers.
- [ ] `MockHardwareLayer` is fully integrated and can be toggled via an environment variable (e.g., `USE_MOCK_HARDWARE=true`) for headless environments.

## Technical Considerations

### Dependencies
- `sox` executable (Required by `node-record-lpcm16` on Windows).

### Risks
- Windows audio routing can be temperamental with Node.js bindings.
- WebSocket binary framing must correctly align with the 16kHz PCM expectation of Gemini.

## Implementation Steps

1. Configure `.env` with `GEMINI_API_KEY`.
2. Install `sox` to enable `node-record-lpcm16`.
3. Add a fallback in `index.ts` to use `MockHardwareLayer` if `USE_MOCK_HARDWARE` is set.
4. Execute `bun index.ts` and verify voice activity.
