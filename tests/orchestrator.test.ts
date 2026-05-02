import { expect, test, mock, describe } from "bun:test";
import { LegionOrchestrator } from "../src/orchestrator";
import { MockHardwareLayer } from "../src/hardware";

// Note: Bun's WebSocket isn't a direct match for the 'ws' package's EventEmitter style without setup,
// so we'll mock the 'ws' WebSocket class signature using a simple EventEmitter mock.
class MockWebSocket {
  listeners: Record<string, Function[]> = {};
  sentMessages: string[] = [];

  on(event: string, callback: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  send(data: string) {
    this.sentMessages.push(data);
  }

  // Helper to simulate incoming messages
  simulateMessage(msg: any) {
    if (this.listeners['message']) {
      this.listeners['message'].forEach(cb => cb(JSON.stringify(msg)));
    }
  }

  // Helper to simulate connection open
  simulateOpen() {
    if (this.listeners['open']) {
      this.listeners['open'].forEach(cb => cb());
    }
  }
}

describe("LegionOrchestrator", () => {
  test("sends setup message on open", () => {
    const ws = new MockWebSocket() as any;
    const hal = new MockHardwareLayer();
    const orchestrator = new LegionOrchestrator(ws, hal);

    ws.simulateOpen();

    expect(ws.sentMessages.length).toBe(1);
    const parsed = JSON.parse(ws.sentMessages[0]);
    expect(parsed.setup).toBeDefined();
    expect(parsed.setup.model).toBe("models/gemini-2.0-flash-exp");
  });

  test("starts recording when setup is complete", () => {
    const ws = new MockWebSocket() as any;
    const hal = new MockHardwareLayer();
    const orchestrator = new LegionOrchestrator(ws, hal);

    expect(hal.recordingCallback).toBeNull();
    ws.simulateMessage({ setupComplete: true });
    expect(hal.recordingCallback).not.toBeNull();
  });

  test("plays incoming audio through speaker", () => {
    const ws = new MockWebSocket() as any;
    const hal = new MockHardwareLayer();
    const orchestrator = new LegionOrchestrator(ws, hal);

    ws.simulateMessage({
      serverContent: {
        modelTurn: {
          parts: [
            {
              inlineData: {
                data: Buffer.from("fakeaudio").toString('base64')
              }
            }
          ]
        }
      }
    });

    expect(hal.writtenBuffers.length).toBe(1);
    expect(hal.writtenBuffers[0].toString()).toBe("fakeaudio");
  });
});
