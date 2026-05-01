import path from 'path';

// Add local sox binary to PATH so child_process and node-record-lpcm16 can find it
process.env.PATH = `${path.join(__dirname, 'sox-bin')};${process.env.PATH}`;

export interface Speaker {
  write(buffer: Buffer): void;
  interrupt(): void;
  close(): void;
}

export interface HardwareAbstractionLayer {
  getSpeaker(sampleRate: number): Speaker;
  startRecording(sampleRate: number, onData: (data: Buffer) => void): void;
  stopRecording(): void;
}

export class NodeHardwareLayer implements HardwareAbstractionLayer {
  getSpeaker(sampleRate: number) {
    const { spawn } = require('child_process');
    let pySpeaker = spawn('python', ['audio_playback.py', sampleRate.toString()]);
    
    pySpeaker.stderr.on('data', (d: Buffer) => console.error("Playback Error:", d.toString()));
    
    return {
      write: (buffer: Buffer) => {
        if (!pySpeaker.stdin.destroyed) {
          pySpeaker.stdin.write(buffer);
        }
      },
      interrupt: () => {
        pySpeaker.kill('SIGTERM');
        pySpeaker = spawn('python', ['audio_playback.py', sampleRate.toString()]);
        pySpeaker.stderr.on('data', (d: Buffer) => console.error("Playback Error:", d.toString()));
      },
      close: () => {
        pySpeaker.kill('SIGTERM');
      }
    };
  }

  private pyMic: any;

  startRecording(sampleRate: number, onData: (data: Buffer) => void): void {
    const { spawn } = require('child_process');
    // Spawn python script to handle recording using pyaudio
    this.pyMic = spawn('python', ['audio_capture.py', sampleRate.toString()]);

    this.pyMic.stdout.on('data', onData);

    this.pyMic.stderr.on('data', (d: Buffer) => console.error("Capture Error:", d.toString()));
    
    this.pyMic.on('close', (code: number) => {
      console.log(`Microphone stopped with code ${code}`);
    });
  }

  stopRecording(): void {
    if (this.pyMic) {
      this.pyMic.kill('SIGTERM');
      this.pyMic = null;
    }
  }
}

export class MockHardwareLayer implements HardwareAbstractionLayer {
  public writtenBuffers: Buffer[] = [];
  public recordingCallback: ((data: Buffer) => void) | null = null;
  public interrupted = false;

  getSpeaker(sampleRate: number) {
    return {
      write: (buffer: Buffer) => {
        this.writtenBuffers.push(buffer);
      },
      interrupt: () => {
        this.writtenBuffers = [];
        this.interrupted = true;
      },
      close: () => {}
    };
  }

  startRecording(sampleRate: number, onData: (data: Buffer) => void): void {
    this.recordingCallback = onData;
  }

  stopRecording(): void {
    this.recordingCallback = null;
  }

  // Helper to simulate microphone input in tests
  simulateAudioInput(data: Buffer) {
    if (this.recordingCallback) {
      this.recordingCallback(data);
    }
  }
}
