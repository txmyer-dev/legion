import path from 'path';

// Add local sox binary to PATH so child_process and node-record-lpcm16 can find it
process.env.PATH = `${path.join(__dirname, 'sox-bin')};${process.env.PATH}`;

export interface HardwareAbstractionLayer {
  getSpeaker(sampleRate: number): { write: (buffer: Buffer) => void };
  startRecording(sampleRate: number, onData: (data: Buffer) => void): void;
}

export class NodeHardwareLayer implements HardwareAbstractionLayer {
  getSpeaker(sampleRate: number) {
    const { spawn } = require('child_process');
    // Spawn python script to handle playback using pyaudio
    const pySpeaker = spawn('python', ['audio_playback.py', sampleRate.toString()]);
    
    pySpeaker.stderr.on('data', (d: Buffer) => console.error("Playback Error:", d.toString()));
    
    return {
      write: (buffer: Buffer) => {
        if (!pySpeaker.stdin.destroyed) {
          pySpeaker.stdin.write(buffer);
        }
      }
    };
  }

  startRecording(sampleRate: number, onData: (data: Buffer) => void): void {
    const { spawn } = require('child_process');
    // Spawn python script to handle recording using pyaudio
    const pyMic = spawn('python', ['audio_capture.py', sampleRate.toString()]);

    pyMic.stdout.on('data', onData);

    pyMic.stderr.on('data', (d: Buffer) => console.error("Capture Error:", d.toString()));
    
    pyMic.on('close', (code: number) => {
      console.log(`Microphone stopped with code ${code}`);
    });
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
