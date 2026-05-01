import WebSocket from 'ws';
import { executeTool } from './tools';
import { loadPersona } from './personaLoader';
import { HardwareAbstractionLayer } from './hardware';

export class LegionOrchestrator {
  private ws: WebSocket;
  private hal: HardwareAbstractionLayer;
  private speaker: { write: (buffer: Buffer) => void };
  private sampleRate: number;
  private model: string;
  private personaName: string;

  constructor(
    ws: WebSocket, 
    hal: HardwareAbstractionLayer, 
    sampleRate: number = 16000,
    model: string = "models/gemini-2.0-flash-exp",
    personaName: string = "ekko-project"
  ) {
    this.ws = ws;
    this.hal = hal;
    this.sampleRate = sampleRate;
    this.speaker = hal.getSpeaker(sampleRate);
    this.model = model;
    this.personaName = personaName;
    
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.ws.on('open', () => {
      console.log("Connected. Sending setup...");
      
      const setupMessage = {
        setup: {
          model: this.model,
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: "Aoede" // Sophisticated voice
                }
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
        }
      };
      this.ws.send(JSON.stringify(setupMessage));
    });

    this.ws.on('message', async (data) => {
      const msg = JSON.parse(data.toString());

      // Handle incoming audio
      if (msg.serverContent && msg.serverContent.modelTurn) {
        const parts = msg.serverContent.modelTurn.parts;
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            const audioBuffer = Buffer.from(part.inlineData.data, 'base64');
            this.speaker.write(audioBuffer);
          }
        }
      }

      // Handle function calls
      if (msg.serverContent && msg.serverContent.modelTurn) {
          const parts = msg.serverContent.modelTurn.parts;
          for (const part of parts) {
              if (part.functionCall) {
                  console.log("Jasper called function:", part.functionCall.name);
                  const response = await executeTool(part.functionCall.name, part.functionCall.args);
                  
                  const functionResponse = {
                      clientContent: {
                          turns: [
                              {
                                  role: "user",
                                  parts: [
                                      {
                                          functionResponse: {
                                              name: part.functionCall.name,
                                              response: { result: response }
                                          }
                                      }
                                  ]
                              }
                          ],
                          turnComplete: true
                      }
                  };
                  this.ws.send(JSON.stringify(functionResponse));
              }
          }
      }

      if (msg.setupComplete) {
        console.log("Setup complete! Jasper is listening... (Speak into your microphone)");
        
        // Start recording and streaming audio
        this.hal.startRecording(this.sampleRate, (data: Buffer) => {
          const audioMessage = {
            realtimeInput: {
              mediaChunks: [
                {
                  mimeType: `audio/pcm;rate=${this.sampleRate}`,
                  data: data.toString('base64')
                }
              ]
            }
          };
          this.ws.send(JSON.stringify(audioMessage));
        });
      }
    });

    this.ws.on('close', () => console.log("Connection closed"));
    this.ws.on('error', (err) => console.error("WebSocket error:", err));
  }
}
