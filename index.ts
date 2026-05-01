import dotenv from 'dotenv';
import { NodeHardwareLayer, MockHardwareLayer, HardwareAbstractionLayer } from './hardware';
import { LegionOrchestrator } from './orchestrator';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Please set GEMINI_API_KEY in your .env file.");
  process.exit(1);
}

// Audio configuration
const SAMPLE_RATE = 16000;

// Setup hardware layer
let hal: HardwareAbstractionLayer;
if (process.env.USE_MOCK_HARDWARE === 'true') {
  console.log("Starting with Mock Hardware Layer (audio simulated).");
  hal = new MockHardwareLayer();
} else {
  hal = new NodeHardwareLayer();
}

console.log("Connecting to Gemini Live API...");

// Launch Orchestrator
const orchestrator = new LegionOrchestrator(API_KEY, hal, SAMPLE_RATE);