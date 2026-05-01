export interface HardwareAbstractionLayer {
  getSpeaker(sampleRate: number): { write: (buffer: Buffer) => void };
  startRecording(sampleRate: number, onData: (data: Buffer) => void): void;
}

export class NodeHardwareLayer implements HardwareAbstractionLayer {
  getSpeaker(sampleRate: number) {
    const Speaker = require('speaker');
    const speaker = new Speaker({
      channels: 1,
      bitDepth: 16,
      sampleRate: sampleRate,
    });
    return {
      write: (buffer: Buffer) => {
        speaker.write(buffer);
      }
    };
  }

  startRecording(sampleRate: number, onData: (data: Buffer) => void): void {
    const record = require('node-record-lpcm16');
    record.record({
      sampleRate: sampleRate,
      channels: 1,
      audioType: 'raw',
    })
    .stream()
    .on('data', onData);
  }
}

export class MockHardwareLayer implements HardwareAbstractionLayer {
  public writtenBuffers: Buffer[] = [];
  public recordingCallback: ((data: Buffer) => void) | null = null;

  getSpeaker(sampleRate: number) {
    return {
      write: (buffer: Buffer) => {
        this.writtenBuffers.push(buffer);
      }
    };
  }

  startRecording(sampleRate: number, onData: (data: Buffer) => void): void {
    this.recordingCallback = onData;
  }

  // Helper to simulate microphone input in tests
  simulateAudioInput(data: Buffer) {
    if (this.recordingCallback) {
      this.recordingCallback(data);
    }
  }
}
