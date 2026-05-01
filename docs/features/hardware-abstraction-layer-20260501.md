# Hardware Abstraction Layer (HAL)

## Overview
The Hardware Abstraction Layer isolates OS-level audio capture and playback mechanics from the core orchestration logic in `index.ts`. This enables cross-platform compatibility and allows mocking of hardware dependencies during Test-Driven Development (TDD).

## Problem Solved
The original implementation tightly coupled `node-record-lpcm16` and `speaker` directly into the `index.ts` WebSocket stream. This prevented testing the state machine without triggering real audio hardware, and introduced cross-platform fragility (especially on Windows).

## Implementation Details

- **`hardware.ts`:** Introduces a generic `HardwareAbstractionLayer` interface.
- **`NodeHardwareLayer`:** A concrete implementation of the interface using the existing Node.js dependencies (`node-record-lpcm16` and `speaker`).

### Code Example
```typescript
export interface HardwareAbstractionLayer {
  getSpeaker(sampleRate: number): { write: (buffer: Buffer) => void };
  startRecording(sampleRate: number, onData: (data: Buffer) => void): void;
}
```

## Future Enhancements
- Implement a `MockHardwareLayer` for automated tests without real audio devices.
- Extend HAL for video capture components if webcam capabilities are added.
