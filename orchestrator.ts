import { GoogleGenAI } from '@google/genai';
import { executeTool } from './tools';
import { loadPersona } from './personaLoader';
import type { HardwareAbstractionLayer, Speaker } from './hardware';
import { TranscriptLogger } from './logger';

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
    model: string = "gemini-3.1-flash-live-preview",
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
    
    this.setupLiveSession();
  }

  private async setupLiveSession() {
    const config: any = {
      responseModalities: ["AUDIO", "TEXT"],
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
            text: loadPersona(this.personaName)
          }
        ]
      },
      tools: [
        {
          functionDeclarations: [
            {
              name: "get_todo_list",
              description: "Fetch the user's open tasks from their to-do list."
            },
            {
              name: "execute_local_command",
              description: "Execute a safe local bash command.",
              parameters: {
                type: "OBJECT",
                properties: {
                  command: { type: "STRING" }
                },
                required: ["command"]
              }
            }
          ]
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

                // Handle function calls
                if (part.functionCall) {
                  const callLog = `Called function: ${part.functionCall.name} with args: ${JSON.stringify(part.functionCall.args)}`;
                  console.log(callLog);
                  this.logger.log('System', callLog);
                  
                  const result = await executeTool(part.functionCall.name, part.functionCall.args);
                  
                  this.session.sendToolResponse({
                    functionResponses: [
                      {
                        name: part.functionCall.name,
                        response: { result: result }
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
      
      console.log("Setup complete! Legion is listening... (Speak into your microphone)");
      this.logger.log('System', 'Session started.');

      // Prompt Gemini to introduce itself to verify audio output works
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
      
    } catch (e) {
      console.error("Failed to setup live session:", e);
    }
  }

  public close() {
    process.stdout.write('\r\x1b[K');
    console.log("Shutting down Legion Orchestrator...");
    this.hal.stopRecording();
    this.speaker.close();
    this.logger.log('System', 'Session ended gracefully.');
  }
}
