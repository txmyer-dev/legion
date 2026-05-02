import { WebSocketServer, WebSocket } from 'ws';
import type { HardwareAbstractionLayer, Speaker } from './hardware';
import { LegionOrchestrator } from './orchestrator';

class GatewaySpeaker implements Speaker {
  constructor(private ws: WebSocket) {}
  
  write(data: Buffer): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'speakerWrite', audioBuffer: data.toString('base64') }));
    }
  }
  
  interrupt(): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'speakerInterrupt' }));
    }
  }
  
  close(): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'speakerClose' }));
    }
  }
}

class GatewayHardwareLayer implements HardwareAbstractionLayer {
  private ws: WebSocket;
  private speaker: GatewaySpeaker;
  private audioCallback: ((data: Buffer) => void) | null = null;
  private videoCallback: ((data: string) => void) | null = null;
  public onWakeWord?: () => void;

  constructor(ws: WebSocket) {
    this.ws = ws;
    this.speaker = new GatewaySpeaker(ws);

    this.ws.on('message', (message: string) => {
      try {
        const msg = JSON.parse(message.toString());
        if (msg.type === 'audioData' && this.audioCallback) {
          this.audioCallback(Buffer.from(msg.data, 'base64'));
        } else if (msg.type === 'videoFrame' && this.videoCallback) {
          this.videoCallback(msg.data);
        } else if (msg.type === 'wakeWordDetected' && this.onWakeWord) {
          this.onWakeWord();
        }
      } catch (e) {
        console.error("Gateway WS parsing error:", e);
      }
    });
  }

  getSpeaker(sampleRate: number): Speaker {
    return this.speaker;
  }

  startRecording(sampleRate: number, onData: (data: Buffer) => void): void {
    this.audioCallback = onData;
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'startRecording', sampleRate }));
    }
  }

  stopRecording(): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'stopRecording' }));
    }
    this.audioCallback = null;
  }

  startVideo(onFrame: (base64Jpeg: string) => void): void {
    this.videoCallback = onFrame;
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'startVideo' }));
    }
  }

  stopVideo(): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'stopVideo' }));
    }
    this.videoCallback = null;
  }
}

export function startGateway(port: number = 9090) {
  const wss = new WebSocketServer({ port });
  console.log(`Legion Gateway started on port ${port}...`);

  wss.on('connection', (ws) => {
    console.log("Node connected!");
    
    const hal = new GatewayHardwareLayer(ws);
    
    // We instantiate Orchestrator but don't start the session until wake word
    // (Assuming orchestrator is modified to not auto-start)
    const orchestrator = new LegionOrchestrator(
      process.env.GEMINI_API_KEY || "",
      hal,
      16000,
      false // Added autoStart parameter
    );

    hal.onWakeWord = () => {
      console.log("Wake word received! Waking up Legion...");
      orchestrator.start();
    };

    ws.on('close', () => {
      console.log("Node disconnected.");
      orchestrator.close();
    });
  });
}

if (require.main === module) {
  startGateway();
}
