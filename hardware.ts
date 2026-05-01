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
  startVideo(onFrame: (base64Jpeg: string) => void): void;
  stopVideo(): void;
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

  private pyVid: any;
  private vidBuffer: string = "";

  startVideo(onFrame: (base64Jpeg: string) => void): void {
    const { spawn } = require('child_process');
    this.pyVid = spawn('python', ['video_capture.py']);
    
    this.pyVid.stdout.on('data', (data: Buffer) => {
      this.vidBuffer += data.toString('utf-8');
      const parts = this.vidBuffer.split('\n');
      
      // All complete frames (except the last item which is incomplete or empty)
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (part && part.trim()) {
          onFrame(part.trim());
        }
      }
      
      // Keep the remaining part in buffer
      this.vidBuffer = parts[parts.length - 1] || "";
    });

    this.pyVid.stderr.on('data', (d: Buffer) => console.error("Video Error:", d.toString()));
    
    this.pyVid.on('close', (code: number) => {
      console.log(`Webcam stopped with code ${code}`);
    });
  }

  stopVideo(): void {
    if (this.pyVid) {
      this.pyVid.kill('SIGTERM');
      this.pyVid = null;
    }
  }
}

export class MockHardwareLayer implements HardwareAbstractionLayer {
  public writtenBuffers: Buffer[] = [];
  public recordingCallback: ((data: Buffer) => void) | null = null;
  public videoCallback: ((data: string) => void) | null = null;
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

  startVideo(onFrame: (base64Jpeg: string) => void): void {
    this.videoCallback = onFrame;
  }

  stopVideo(): void {
    this.videoCallback = null;
  }

  // Helper to simulate microphone input in tests
  simulateAudioInput(data: Buffer) {
    if (this.recordingCallback) {
      this.recordingCallback(data);
    }
  }

  // Helper to simulate webcam frame in tests
  simulateVideoInput(base64Jpeg: string) {
    if (this.videoCallback) {
      this.videoCallback(base64Jpeg);
    }
  }
}
