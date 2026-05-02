import { GoogleGenAI } from '@google/genai';
import { pluginManager } from './plugins/index';
import { loadPersona } from './personaLoader';
import { skillLoader } from './skillLoader';
import type { HardwareAbstractionLayer, Speaker } from './hardware';
import { TranscriptLogger } from './logger';

// Gemini Live API rejects tool responses that are too large (1008 error).
// Cap all tool responses at 8KB to keep the session stable.
const MAX_TOOL_RESPONSE_BYTES = 8192;
function truncateToolResult(result: any): any {
  const json = JSON.stringify(result);
  if (json.length <= MAX_TOOL_RESPONSE_BYTES) return result;
  const truncated = json.slice(0, MAX_TOOL_RESPONSE_BYTES);
  return { truncated: true, note: `Response truncated to ${MAX_TOOL_RESPONSE_BYTES} bytes`, data: truncated };
}

export class LegionOrchestrator {
  private ai: GoogleGenAI;
  private session: any; // Session object from @google/genai
  private hal: HardwareAbstractionLayer;
  private speaker: Speaker;
  private sampleRate: number;
  private model: string;
  private personaName: string;
  private logger: TranscriptLogger;
  private agentState: 'Listening' | 'Speaking' = 'Listening';
  private isConnecting: boolean = false;

  private updateStatus() {
    process.stdout.write('\r\x1b[K'); // clear line
    if (this.agentState === 'Listening') {
      process.stdout.write('🟢 Listening...');
    } else if (this.agentState === 'Speaking') {
      process.stdout.write('🟣 Speaking...');
    }
  }

  constructor(
    apiKey: string,
    hal: HardwareAbstractionLayer, 
    sampleRate: number = 16000,
    autoStart: boolean = true,
    model: string = "gemini-2.5-flash-native-audio-latest",
    personaName: string = "ekko-project"
  ) {
    // Note: Live API endpoints may still require v1alpha for some models. 
    // If needed we could add httpOptions: { apiVersion: 'v1alpha' }
    this.ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: 'v1alpha' } });
    this.hal = hal;
    this.sampleRate = sampleRate;
    this.speaker = hal.getSpeaker(sampleRate);
    this.model = model;
    this.personaName = personaName;
    this.logger = new TranscriptLogger();
    
    if (autoStart) {
      this.start();
    }
  }

  public start() {
    if (this.session || this.isConnecting) return;
    this.isConnecting = true;
    this.setupLiveSession().finally(() => {
        this.isConnecting = false;
    });
  }

  private async setupLiveSession() {
    const config: any = {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: "Aoede" // Sophisticated voice
          }
        }
      },
      systemInstruction: {
        parts: [
          {
            text: loadPersona(this.personaName) + skillLoader.loadAlwaysSkills()
          }
        ]
      },
      tools: [
        {
          functionDeclarations: pluginManager.getFunctionDeclarations()
        }
      ]
    };

    try {
      this.session = await this.ai.live.connect({
        model: this.model,
        config: config,
        callbacks: {
          onmessage: async (response: any) => {
            // Handle incoming audio
            const content = response.serverContent;
            
            if (response.setupComplete) {
              console.log("Setup complete from server! Legion is listening... (Speak into your microphone)");
              this.logger.log('System', 'Session started.');

              // Prompt Gemini to introduce itself
              this.session.sendClientContent({
                turns: [
                  { role: "user", parts: [{ text: "Hello! Please introduce yourself shortly." }] }
                ],
                turnComplete: true
              });
              this.logger.log('User', "Hello! Please introduce yourself shortly.");

              // Start recording and streaming audio
              this.hal.startRecording(this.sampleRate, (data: Buffer) => {
                try {
                  this.session.sendRealtimeInput({
                    audio: {
                      mimeType: `audio/pcm;rate=${this.sampleRate}`,
                      data: data.toString('base64')
                    }
                  });
                } catch (err) {
                  console.error("\nError streaming audio to Gemini:", err);
                }
              });

              // Start streaming video if available
              this.hal.startVideo((base64Jpeg: string) => {
                try {
                  this.session.sendRealtimeInput({
                    video: {
                      mimeType: "image/jpeg",
                      data: base64Jpeg
                    }
                  });
                } catch (err) {
                  console.error("\nError streaming video to Gemini:", err);
                }
              });
            }

            
            if (content?.interrupted) {
              this.logger.log('System', 'User interrupted Gemini.');
              this.speaker.interrupt();
              this.agentState = 'Listening';
              this.updateStatus();
              return;
            }

            if (content?.turnComplete) {
              this.agentState = 'Listening';
              this.updateStatus();
            }

            if (content?.modelTurn) {
              if (this.agentState !== 'Speaking') {
                this.agentState = 'Speaking';
                this.updateStatus();
              }
              const parts = content.modelTurn.parts;
              for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                  const audioBuffer = Buffer.from(part.inlineData.data, 'base64');
                  this.speaker.write(audioBuffer);
                }
                
                if (part.text) {
                  this.logger.log('Legion', part.text);
                }


              }
            }

            // Handle function calls (Bidi API sends this at the response root, not inside modelTurn)
            if (response.toolCall && response.toolCall.functionCalls) {
              for (const call of response.toolCall.functionCalls) {
                const callLog = `\nCalled function: ${call.name} with args: ${JSON.stringify(call.args)}`;
                console.log(callLog);
                this.logger.log('System', callLog);
                
                try {
                  const raw = await pluginManager.executeTool(call.name, call.args);
                  const result = truncateToolResult(raw);
                  this.session.sendToolResponse({
                    functionResponses: [
                      {
                        id: call.id,
                        name: call.name,
                        response: { result: result }
                      }
                    ]
                  });
                } catch (e: any) {
                  console.error("\nError executing tool:", e);
                  this.session.sendToolResponse({
                    functionResponses: [
                      {
                        id: call.id,
                        name: call.name,
                        response: { error: e.toString() }
                      }
                    ]
                  });
                }
              }
            }
          },
          onclose: (event: any) => {
            console.log("Connection closed", event);
          },
          onerror: (error: any) => {
            console.error("Session error:", error);
          }
        }
      });
      

    } catch (e) {
      console.error("Failed to setup live session:", e);
    }
  }

  public close() {
    process.stdout.write('\r\x1b[K');
    console.log("Shutting down Legion Orchestrator...");
    this.hal.stopRecording();
    this.hal.stopVideo();
    this.speaker.close();
    this.logger.log('System', 'Session ended gracefully.');
  }
}
