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
            text: loadPersona(this.personaName)
          }
        ]
      },
      tools: [
        { googleSearch: {} },
        {
          functionDeclarations: [
            {
              name: "get_tasks",
              description: "Fetch the user's open tasks from Todoist.",
              parameters: {
                type: "OBJECT",
                properties: {}
              }
            },
            {
              name: "add_task",
              description: "Add a new task to Todoist.",
              parameters: {
                type: "OBJECT",
                properties: {
                  content: { type: "STRING", description: "The task name/content" },
                  description: { type: "STRING", description: "Optional description" },
                  due_string: { type: "STRING", description: "Optional due date like 'tomorrow at 12pm'" }
                },
                required: ["content"]
              }
            },
            {
              name: "read_note",
              description: "Read a markdown note from the user's Obsidian SecondBrain vault.",
              parameters: {
                type: "OBJECT",
                properties: {
                  path: { type: "STRING", description: "Relative path to the note (e.g., 'Ideas/Project.md')" }
                },
                required: ["path"]
              }
            },
            {
              name: "append_note",
              description: "Append content to an existing markdown note in the Obsidian vault.",
              parameters: {
                type: "OBJECT",
                properties: {
                  path: { type: "STRING", description: "Relative path to the note (e.g., 'Ideas/Project.md')" },
                  content: { type: "STRING", description: "The markdown content to append" }
                },
                required: ["path", "content"]
              }
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
            },
            {
              name: "manipulate_browser",
              description: "Perform an action on the headless browser.",
              parameters: {
                type: "OBJECT",
                properties: {
                  action: { type: "STRING", description: "goto, click, type, extract, screenshot, close" },
                  url: { type: "STRING" },
                  selector: { type: "STRING" },
                  value: { type: "STRING" }
                },
                required: ["action"]
              }
            },
            {
              name: "manage_calendar",
              description: "Manage Google Calendar events.",
              parameters: {
                type: "OBJECT",
                properties: {
                  action: { type: "STRING", description: "list_events, create_event" },
                  maxResults: { type: "INTEGER", description: "Max events to list" },
                  summary: { type: "STRING", description: "Event title" },
                  description: { type: "STRING", description: "Event description" },
                  start: { type: "STRING", description: "ISO string for event start" },
                  end: { type: "STRING", description: "ISO string for event end" }
                },
                required: ["action"]
              }
            },
            {
              name: "trigger_compound_workflow",
              description: "Trigger a local compound workflow shell script (e.g., compound-dashboard, compound-health).",
              parameters: {
                type: "OBJECT",
                properties: {
                  workflow: { type: "STRING", description: "The name of the workflow script without the .sh extension (e.g. 'compound-dashboard', 'update-solution-ref')" }
                },
                required: ["workflow"]
              }
            },
            {
              name: "generate_image",
              description: "Generate an image using DALL-E 3 based on a text prompt.",
              parameters: {
                type: "OBJECT",
                properties: {
                  prompt: { type: "STRING", description: "The descriptive text prompt for the image." },
                  size: { type: "STRING", description: "The size of the image, e.g., '1024x1024'" }
                },
                required: ["prompt"]
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
                  const result = await executeTool(call.name, call.args);
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
