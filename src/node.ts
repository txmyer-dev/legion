import WebSocket from 'ws';
import { NodeHardwareLayer } from './hardware';
import { WakeWordEngine } from './wake_word';
import { spawn, ChildProcess } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'personas/ekko-project/.env') });


export function startNode(gatewayUrl: string = 'ws://localhost:9090'): () => void {
  const ws = new WebSocket(gatewayUrl);
  const hal = new NodeHardwareLayer();
  const speaker = hal.getSpeaker(24000);

  let isWaking = false;
  const triggerWakeWord = () => {
    if (isWaking) return;
    isWaking = true;
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'wakeWordDetected' }));
    }
    // Debounce to prevent hotkey spam
    setTimeout(() => { isWaking = false; }, 3000);
  };

  const wakeWordEngine = new WakeWordEngine(triggerWakeWord);
  
  const path = require('path');
  const hotkeyProc: ChildProcess = spawn('python', [path.join(__dirname, '../python/hotkey.py')]);
  hotkeyProc.stdout?.on('data', (data) => {
    if (data.toString().includes('TRIGGERED')) {
      console.log("\n⌨️ Hotkey detected! Waking up Legion...");
      triggerWakeWord();
    }
  });

  ws.on('open', () => {
    console.log("Connected to Legion Gateway!");
    console.log("Press Ctrl+Shift+L to trigger manually.");
    wakeWordEngine.start();
  });

  ws.on('message', (message: string) => {
    try {
      const msg = JSON.parse(message.toString());
      switch (msg.type) {
        case 'startRecording':
          console.log("Gateway requested: startRecording");
          hal.startRecording(msg.sampleRate || 16000, (data: Buffer) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'audioData', data: data.toString('base64') }));
            }
          });
          break;
        case 'stopRecording':
          console.log("Gateway requested: stopRecording");
          hal.stopRecording();
          break;
        case 'startVideo':
          console.log("Gateway requested: startVideo");
          hal.startVideo((base64Jpeg: string) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'videoFrame', data: base64Jpeg }));
            }
          });
          break;
        case 'stopVideo':
          console.log("Gateway requested: stopVideo");
          hal.stopVideo();
          break;
        case 'speakerWrite':
          speaker.write(Buffer.from(msg.audioBuffer, 'base64'));
          break;
        case 'speakerInterrupt':
          console.log("Gateway requested: speakerInterrupt");
          speaker.interrupt();
          break;
        case 'speakerClose':
          console.log("Gateway requested: speakerClose");
          speaker.close();
          break;
        default:
          console.warn("Unknown message from gateway:", msg.type);
      }
    } catch (e) {
      console.error("Node WS parsing error:", e);
    }
  });

  ws.on('close', () => {
    console.log("Disconnected from Gateway. Shutting down hardware...");
    wakeWordEngine.stop();
    hotkeyProc.kill();
    hal.stopRecording();
    hal.stopVideo();
    speaker.close();
    if (require.main === module) process.exit(0);
  });

  ws.on('error', (err) => {
    console.error("Node WS error:", err);
  });

  // Handle graceful exit
  process.on('SIGINT', () => {
    console.log("\nNode shutting down gracefully...");
    wakeWordEngine.stop();
    hotkeyProc.kill();
    hal.stopRecording();
    hal.stopVideo();
    speaker.close();
    ws.close();
    if (require.main === module) process.exit(0);
  });

  return () => {
    ws.close();
  };
}

if (require.main === module) {
  const url = process.argv[2] || 'ws://localhost:9090';
  startNode(url);
}
