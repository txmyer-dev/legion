# Legion: Master Project Specification & Roadmap

> **Status:** Active
> **Goal:** Build a production-ready, always-on, multimodal AI assistant (Legion/Ekko) for Windows 11.
> **Philosophy:** One source of truth. This document defines the architecture, capabilities, and the exact chronological sequence of implementation.

---

## 1. Overview & Goals
Legion is a real-time, multimodal, agentic assistant designed specifically for a Windows 11 desktop environment. It provides continuous audio-visual perception, robust local hardware integration (mic, webcam), and explicit boundaries for local browser and filesystem manipulation.

**Key Goals:**
*   **Sub-second Latency:** Achieve highly responsive conversational loops using the Gemini Multimodal Live API.
*   **Hardware Integration:** Natively integrate with Windows 11 hardware using Python bridges.
*   **Browser Orchestration:** Equip the agent with the ability to manipulate a headed browser.
*   **Dynamic Personas:** Separate persona instructions from the core logic, loaded at runtime.
*   **Testability:** Isolate the Tool Dispatcher from the WebSocket layer for complete TDD.

---

## 2. System Architecture

To achieve sub-second latency and stability, the architecture is divided into three main layers:

### A. The Orchestration Layer (Gateway / Node Split)
*   **Linux Gateway (Remote):** A Node.js server that maintains a continuous bidirectional WebSocket (`BidiGenerateContent`) connection with the Gemini Live API. It handles tool execution, state management, and logging.
*   **Windows Node (Local):** A lightweight client running natively on the host machine. It handles raw physical hardware using Python bridges (`pyaudio` for audio, `opencv` for vision) and streams the binary data over WebSockets to the Gateway.

### B. The Intelligence Layer (Google Gemini)
*   **Model:** `gemini-2.5-flash-native-audio-latest` configured for real-time voice and video.
*   **Persona Manager:** Loads `.md` configs (`SOUL.md`, `TOOLS.md`, `AGENTS.md`) from the user's SecondBrain to establish identity (e.g., "Ekko").

### C. The Tooling / Agentic Layer
*   **Perception:** Audio streams in full-duplex. Vision streams at ~1 FPS using OpenCV.
*   **Execution Sandbox:** Explicit allow/deny lists for directories and commands (`tools.ts`).
*   **Capabilities:** 
    *   Todoist Task Management (`get_tasks`)
    *   Google Calendar (`manage_calendar`)
    *   Local Filesystem/Obsidian (`read_note`, `execute_local_command`)
    *   Image Generation/Manipulation

---

## 3. Master Roadmap

*This timeline defines the exact path to completion. If a Phase is marked COMPLETED, its tasks are fully implemented and tested. There should never be ambiguity about what phase comes next.*

### 🟢 Phase 1: The Core Pipeline (COMPLETED)
**Objective:** Establish the foundational real-time connection and basic security sandbox.
- [x] Establish bidirectional WebSocket connection to Gemini Multimodal Live API.
- [x] Abstract audio I/O using Python `pyaudio` bridges for Windows native support.
- [x] Implement path traversal sandbox and shell command whitelist.
- [x] Implement dynamic Persona Loader enforcing explicit `SOUL.md`, `TOOLS.md`, and `AGENTS.md` context separation.

### 🟢 Phase 2: Conversational UX & State Management (COMPLETED)
**Objective:** Make the voice interactions feel natural, interruptible, and memorable.
- [x] **Barge-in / Interruptibility:** Handle interruptions by explicitly sending a flush/kill signal to the `audio_playback.py` process.
- [x] **Session Transcripts:** Capture audio chunks and save them to `docs/logs/{date}-session.md`.
- [x] **Graceful Exit:** Catch `Ctrl+C` (SIGINT) to properly close WebSockets and kill Python bridges.
- [x] **Terminal UI (TUI):** Clean visual indicators (🟢 Listening, 🔵 Thinking, 🟣 Speaking).

### 🟢 Phase 3: OS Integration & Advanced Tools (COMPLETED)
**Objective:** Deepen the agent's connection to the user's SecondBrain and Windows system.
- [x] **Task Backend Integration:** Todoist (`get_tasks`) and local Obsidian vault (`read_note`/`append_note`).
- [x] **Calendar Integration:** `manage_calendar` using Google Calendar API.
- [x] **Image & Shell Tools:** Secure OS execution capabilities.
- [x] **Bidi Tool Calling Refactor:** Intercept `response.toolCall` from the Gemini Live server and respond synchronously with matching function execution IDs.

### 🟢 Phase 4: Gateway & Daemon Architecture (COMPLETED)
**Objective:** Transition to a Gateway/Node architecture to separate heavy routing from the local Windows environment.
- [x] **Gateway/Node Split:** Decouple local hardware scripts from the Gemini Orchestrator.
- [x] **Hardware Hotkey:** Implement global Windows shortcut listener (`Ctrl+Shift+L`) to trigger the agent manually.
- [x] **Filesystem Refactor:** Consolidate directories into `/src`, `/python`, `/tests`, and `/scripts`.

### 🟢 Phase 5: Vision & Multimodal Awareness (COMPLETED)
**Objective:** Give Legion the ability to see its environment and manipulate the web.
- [x] **Task 5.1: Vision Dependencies:** Added `opencv-python` to `python/requirements.txt` to fix the `video_capture.py` crashing issue.
- [x] **Task 5.2: Multimodal Splicing:** Node captures 1 FPS base64 frames and interleaves them into the WebSocket payload.
- [x] **Task 5.3: Playwright Orchestration:** Implemented `manipulate_browser` tool in `src/browser.ts` for DOM interactions.

### 🟢 Phase 6: The "Always-On" Wake Word (COMPLETED)
**Objective:** Allow seamless voice activation without keyboard shortcuts.
- [x] **Task 6.1: Wake-Word Engine:** Configured `@picovoice/porcupine-node` in `src/wake_word.ts` (Requires `PICOVOICE_ACCESS_KEY` in `.env`).
- [x] **Task 6.2: Background Service:** Integrated Node initialization natively into the System Tray GUI background.

### 🟡 Phase 7: GUI & Quality of Life (CURRENT)
**Objective:** Build a user-friendly interface for managing the Node without touching code or scripts.
- [x] **Task 7.1: System Tray GUI:** Created `src/gui.ts` as an Electron app that lives in the Windows System Tray and runs the Node.
- [x] **Task 7.2: Dynamic Gateway Routing:** Implement a settings UI with a server dropdown, allowing the user to dynamically point the Node to different Gateway IP addresses.
- [x] **Task 7.3: Security Audit & E2E Playtesting:** Hardened the `validatePath` security boundaries and verified Docker read-only sandbox isolation. Ready for dogfooding.
