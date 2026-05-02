import path from 'path';
import os from 'os';
import { startGateway } from './gateway';
import { startNode } from './node';
import { loadGoogleSecrets } from './secretLoader';

// Block the boot sequence until secrets are injected into memory
await loadGoogleSecrets('personal-api-488606', 'LEGION_EKKO_SECRETS');

const mode = process.argv[2];

if (mode === 'gateway') {
    const port = parseInt(process.argv[3] || '9090', 10);
    startGateway(port);
} else if (mode === 'node') {
    const url = process.argv[3] || 'ws://localhost:9090';
    startNode(url);
} else {
    console.log("Usage:");
    console.log("  bun run src/index.ts gateway [port]");
    console.log("  bun run src/index.ts node [ws://gateway-url:9090]");
    console.log("\nNote: The gateway runs on your Linux VPS and handles Gemini Orchestration.");
    console.log("The node runs on your Windows machine and handles native hardware (audio/video).");
}