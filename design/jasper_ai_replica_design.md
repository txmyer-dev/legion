# Jasper AI Replica Design Document

This document outlines the architecture and implementation design to replicate the "Jasper" AI assistant demonstrated by Gareth, which utilizes Google's Live API for real-time, multimodal, and agentic capabilities.

## Overview of Capabilities
Based on the demonstration, Jasper possesses the following capabilities:
1. **Low-latency Voice Interaction**: Fast, conversational responses with a specific persona (Jarvis-like).
2. **Vision/Multimodal Awareness**: Ability to see through a webcam or screen capture (e.g., identifying "red objects" in the background).
3. **Image Generation/Manipulation**: Capturing a photo and restyling it (e.g., turning the user into a cartoon).
4. **Local System Control**: Executing local applications, shortcuts, and saving files.
5. **Productivity Integration**: Managing calendars, tracking to-do lists, and initiating/terminating meeting recordings.

---

## System Architecture

To achieve sub-second latency and real-time multimodal interaction, the system will be built around the **Google Gemini Multimodal Live API**. The architecture is divided into three main layers:

### 1. The Orchestration Layer (Local Application)
A desktop application (e.g., built with Python or Node.js/Electron) that acts as the central hub.
- **WebSocket Client**: Maintains a continuous bidirectional WebSocket (`BidiGenerateContent`) connection with the Gemini Live API.
- **Device Manager**: Interfaces with local hardware (Microphone, Speakers, Webcam).
- **Tool Executor**: A dispatcher that listens for `FunctionCall` requests from the Gemini API and executes local scripts or API calls.

### 2. The Intelligence Layer (Google Gemini Live API)
- **Model**: `gemini-2.0-flash-exp` (or equivalent live API model) configured for real-time voice and video.
- **System Instructions**: Instruct the model to adopt the "Jasper/Jarvis" persona, be concise, and proactively use tools when requested.
- **Voice**: Configured with a sophisticated, British-accented voice to match the Jarvis persona (e.g., `Voice.PUCK` or `Voice.Aoede`).

### 3. The Tooling / Agentic Layer
The tools exposed to Gemini via Function Calling:
- **`get_tasks()`**: Fetches open tasks from a local markdown file, Todoist, or Notion.
- **`take_webcam_snapshot()`**: Grabs the current frame from the webcam.
- **`generate_cartoon_avatar(image_data)`**: Uses an image-to-image model or Google's Imagen to restyle the snapshot.
- **`execute_local_command(command)`**: Runs OS-level commands (e.g., opening applications). *Note: Requires strict security sandboxing.*
- **`manage_calendar()`**: Integrates with Google Calendar API.

---

## Core Components Implementation

### A. Real-Time Audio & Video Streaming
- **Audio Input**: Capture PCM audio from the microphone at 16kHz or 24kHz and stream it as base64-encoded chunks to the WebSocket.
- **Audio Output**: Receive audio chunks from the WebSocket and play them through the local speaker queue seamlessly.
- **Video Input**: Capture webcam frames at ~1 frame per second (FPS) to save bandwidth while maintaining visual context, sending them as base64 JPEG images interleaved with the audio stream.

### B. Wake Word & Push-to-Talk (Optional but Recommended)
While the Live API can be continuous, sending 24/7 audio can be expensive and privacy-invasive. 
- Use a local wake-word engine like **Picovoice Porcupine** to listen for "Hey Jasper". Once triggered, open the WebSocket to Google's Live API.

### C. Persona and System Prompt
```text
You are Jasper, a highly sophisticated digital assistant inspired by Jarvis. You are witty, slightly sarcastic but deeply loyal and helpful. You reside on the user's local machine and have access to their webcam, microphone, screen, and local file system. Keep your responses concise and conversational.
```

---

## Tech Stack Recommendations

| Component | Recommendation | Alternatives |
| :--- | :--- | :--- |
| **Backend/Core Engine** | Node.js / TypeScript | Python |
| **API** | Google Gemini Multimodal Live API | OpenAI Realtime API (Slower visual processing as per Gareth) |
| **Audio Processing** | `node-record-lpcm16` + `speaker` | PyAudio (Python) |
| **Video/Webcam** | `node-webcam` or OpenCV | OpenCV (Python) |
| **UI (Optional)** | Next.js + Tailwind (Dark Theme) | Electron / Terminal UI |
| **Wake Word** | Picovoice Porcupine | Vosk |

---

## Next Steps for Development
1. **API Key Setup**: Secure a Google Gemini API Key with access to the Live API.
2. **Basic Audio Loop**: Implement the bidirectional WebSocket connection just for Voice-in/Voice-out.
3. **Add Vision**: Integrate the webcam feed, sending frames every second. Test with a prompt like "What am I holding?".
4. **Implement Tools**: Add local function calling starting with a simple `get_todo_list` function reading from a local text file.
5. **UI Polish**: Build the dark-themed UI to visualize the audio waveforms and display generated images.
