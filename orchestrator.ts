import { GoogleGenAI } from '@google/genai';
import { executeTool } from './tools';
import { loadPersona } from './personaLoader';
import { HardwareAbstractionLayer } from './hardware';

export class LegionOrchestrator {
  private ai: GoogleGenAI;
  private session: any; // Session object from @google/genai
  private hal: HardwareAbstractionLayer;
  private speaker: { write: (buffer: Buffer) => void };
  private sampleRate: number;
  private model: string;
  private personaName: string;

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
    
    this.setupLiveSession();
  }

  private async setupLiveSession() {
    const config = {
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
            // Log response briefly (don't log the whole base64 audio)
            if (response.serverContent?.modelTurn) {
              console.log("Received audio/function call from Gemini.");
            } else if (response.serverContent?.turnComplete) {
              console.log("Gemini finished speaking.");
            } else {
              console.log("Received message:", JSON.stringify(response, null, 2).substring(0, 200));
            }

            // Handle incoming audio
            const content = response.serverContent;
            if (content?.modelTurn) {
              const parts = content.modelTurn.parts;
              for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                  const audioBuffer = Buffer.from(part.inlineData.data, 'base64');
                  this.speaker.write(audioBuffer);
                }
                // Handle function calls
                if (part.functionCall) {
                  console.log("Jasper called function:", part.functionCall.name);
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
      
      console.log("Setup complete! Jasper is listening... (Speak into your microphone)");

      // Prompt Gemini to introduce itself to verify audio output works
      this.session.sendClientContent({
        turns: [
          { role: "user", parts: [{ text: "Hello! Please introduce yourself shortly." }] }
        ],
        turnComplete: true
      });

      // Start recording and streaming audio
      this.hal.startRecording(this.sampleRate, (data: Buffer) => {
        try {
          process.stdout.write("."); // Log a dot for every audio chunk sent to show activity
          this.session.sendRealtimeInput({
            audio: {
              mimeType: `audio/pcm;rate=${this.sampleRate}`,
              data: data.toString('base64')
            }
          });
        } catch (err) {
          console.error("Error streaming audio to Gemini:", err);
        }
      });
      
    } catch (e) {
      console.error("Failed to setup live session:", e);
    }
  }
}
