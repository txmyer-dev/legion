import { Porcupine } from '@picovoice/porcupine-node';
import { PvRecorder } from '@picovoice/pvrecorder-node';

export class WakeWordEngine {
  private porcupine: Porcupine | null = null;
  private recorder: PvRecorder | null = null;
  private isListening = false;
  private onWakeWord: () => void;

  constructor(onWakeWord: () => void) {
    this.onWakeWord = onWakeWord;
  }

  public async start() {
    const accessKey = process.env.PICOVOICE_ACCESS_KEY;
    if (!accessKey) {
      console.warn("PICOVOICE_ACCESS_KEY not set. Wake-word engine is disabled.");
      return;
    }

    // You can replace "porcupine" with a custom .ppn file path if you train "We Are Legion"
    const keywordPath = process.env.PICOVOICE_KEYWORD_PATH || 'porcupine';

    try {
      if (keywordPath === 'porcupine' || keywordPath === 'bumblebee' || keywordPath === 'jarvis') {
          // Use built-in
          this.porcupine = new Porcupine(accessKey, [keywordPath], [0.5]);
      } else {
          // Use custom path
          this.porcupine = new Porcupine(accessKey, [keywordPath], [0.5]);
      }
      
      const frameLength = this.porcupine.frameLength;
      
      // Device index -1 is default microphone
      this.recorder = new PvRecorder(frameLength, -1);
      this.recorder.start();
      this.isListening = true;

      console.log(`Wake-word engine started. Listening for '${keywordPath}'...`);

      this.processAudio();
    } catch (e: any) {
      console.error("Failed to start Wake-Word engine:", e.message);
    }
  }

  private async processAudio() {
    if (!this.isListening || !this.recorder || !this.porcupine) return;

    try {
      const pcm = await this.recorder.read();
      const keywordIndex = this.porcupine.process(pcm);

      if (keywordIndex >= 0) {
        console.log("\n🔊 Wake word detected!");
        this.onWakeWord();
      }

      // Schedule next read
      setImmediate(() => this.processAudio());
    } catch (e: any) {
      console.error("Error in wake-word audio processing:", e.message);
    }
  }

  public stop() {
    this.isListening = false;
    if (this.recorder) {
      this.recorder.release();
      this.recorder = null;
    }
    if (this.porcupine) {
      this.porcupine.release();
      this.porcupine = null;
    }
  }
}
