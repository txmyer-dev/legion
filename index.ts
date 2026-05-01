import WebSocket from 'ws';
import record from 'node-record-lpcm16';
import Speaker from 'speaker';
import dotenv from 'dotenv';
import { executeTool } from './tools';
import { loadPersona } from './personaLoader';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Please set GEMINI_API_KEY in your .env file.");
  process.exit(1);
}

const MODEL = "models/gemini-2.0-flash-exp";
const HOST = "generativelanguage.googleapis.com";
const WS_URL = `wss://${HOST}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${API_KEY}`;

// Audio configuration
const SAMPLE_RATE = 16000;

// Setup speaker for output
const speaker = new Speaker({
  channels: 1,
  bitDepth: 16,
  sampleRate: SAMPLE_RATE,
});

console.log("Connecting to Gemini Live API...");
const ws = new WebSocket(WS_URL);

ws.on('open', () => {
  console.log("Connected. Sending setup...");
  
  // 1. Send Setup message
  const setupMessage = {
    setup: {
      model: MODEL,
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
            text: loadPersona("ekko-project")
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
  ws.send(JSON.stringify(setupMessage));
});

ws.on('message', async (data) => {
  const msg = JSON.parse(data.toString());

  // Handle incoming audio
  if (msg.serverContent && msg.serverContent.modelTurn) {
    const parts = msg.serverContent.modelTurn.parts;
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        const audioBuffer = Buffer.from(part.inlineData.data, 'base64');
        speaker.write(audioBuffer);
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
              ws.send(JSON.stringify(functionResponse));
          }
      }
  }

  if (msg.setupComplete) {
    console.log("Setup complete! Jasper is listening... (Speak into your microphone)");
    
    // Start recording and streaming audio
    record.record({
      sampleRate: SAMPLE_RATE,
      channels: 1,
      audioType: 'raw',
    })
    .stream()
    .on('data', (data: Buffer) => {
      const audioMessage = {
        realtimeInput: {
          mediaChunks: [
            {
              mimeType: `audio/pcm;rate=${SAMPLE_RATE}`,
              data: data.toString('base64')
            }
          ]
        }
      };
      ws.send(JSON.stringify(audioMessage));
    });
  }
});

ws.on('close', () => console.log("Connection closed"));
ws.on('error', (err) => console.error("WebSocket error:", err));