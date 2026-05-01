import dotenv from 'dotenv';
import { startGateway } from './gateway';
import { startNode } from './node';

dotenv.config();

const mode = process.argv[2];

if (mode === 'gateway') {
    const port = parseInt(process.argv[3] || '8080', 10);
    startGateway(port);
} else if (mode === 'node') {
    const url = process.argv[3] || 'ws://localhost:8080';
    startNode(url);
} else {
    console.log("Usage:");
    console.log("  bun run index.ts gateway [port]");
    console.log("  bun run index.ts node [ws://gateway-url:8080]");
    console.log("\nNote: The gateway runs on your Linux VPS and handles Gemini Orchestration.");
    console.log("The node runs on your Windows machine and handles native hardware (audio/video).");
}