# Jasper AI Replica (Google Gemini Live API)

This project is a minimal implementation replicating the core voice and tool-calling capabilities of Gareth's Jasper AI. It streams audio continuously from your local microphone to Google's Gemini Multimodal Live API (`gemini-2.0-flash-exp`) and plays the AI's audio responses back through your speakers.

## Prerequisites
- **Bun** (for running the TypeScript file)
- **SoX** (`node-record-lpcm16` requires `sox` or `rec` installed on your system to capture microphone audio). 
  - On Ubuntu/Debian: `sudo apt-get install sox libsox-fmt-all`
  - On macOS: `brew install sox`
- **ALSA headers** (Linux only, for the `speaker` package).
  - On Ubuntu/Debian: `sudo apt-get install libasound2-dev`

## Setup
1. Copy `.env.example` to `.env` and insert your Gemini API Key:
   ```bash
   cp .env.example .env
   # Edit .env with your key
   ```

2. Install dependencies (if not already installed):
   ```bash
   bun install
   ```

3. Run the application:
   ```bash
   bun run index.ts
   ```

## Architecture
- `index.ts`: The main orchestration script. It sets up the WebSocket connection to Gemini, negotiates the `setup` message, and handles the continuous audio I/O streaming using `node-record-lpcm16` and `speaker`.
- `tools.ts`: Defines the local function-calling execution environment. You can expand this to execute custom scripts, modify local files, and hook into Notion/Todoist.

## Customization
If you want to integrate the webcam, you can extend `index.ts` to capture frames via OpenCV or `node-webcam` and push them as `IMAGE` inline data parts to the WebSocket alongside the audio stream.
