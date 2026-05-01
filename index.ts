import WebSocket from 'ws';
import dotenv from 'dotenv';
import { NodeHardwareLayer } from './hardware';
import { LegionOrchestrator } from './orchestrator';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Please set GEMINI_API_KEY in your .env file.");
  process.exit(1);
}

const HOST = "generativelanguage.googleapis.com";
const WS_URL = `wss://${HOST}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${API_KEY}`;

// Audio configuration
const SAMPLE_RATE = 16000;

// Setup hardware layer
const hal = new NodeHardwareLayer();

console.log("Connecting to Gemini Live API...");
const ws = new WebSocket(WS_URL);

// Launch Orchestrator
const orchestrator = new LegionOrchestrator(ws, hal, SAMPLE_RATE);