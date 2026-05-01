import record from 'node-record-lpcm16';
import Speaker from 'speaker';

export interface HardwareAbstractionLayer {
  getSpeaker(sampleRate: number): { write: (buffer: Buffer) => void };
  startRecording(sampleRate: number, onData: (data: Buffer) => void): void;
}

export class NodeHardwareLayer implements HardwareAbstractionLayer {
  getSpeaker(sampleRate: number) {
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
    record.record({
      sampleRate: sampleRate,
      channels: 1,
      audioType: 'raw',
    })
    .stream()
    .on('data', onData);
  }
}
