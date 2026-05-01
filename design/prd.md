# Product Requirements Document: Legion (Jasper AI Clone)

## 1. Overview
Legion is a real-time, multimodal, agentic assistant designed specifically for a Windows 11 desktop environment. It replicates and expands upon the "Jasper AI" setup (originally demonstrated using Google's Live API) by providing continuous audio-visual perception, robust local hardware integration (mic, webcam), and explicit boundaries for local browser and filesystem manipulation.

## 2. Goals
*   **Sub-second Latency:** Achieve highly responsive conversational loops using the Gemini Multimodal Live API.
*   **Hardware Integration:** Natively integrate with Windows 11 hardware (Microphone for input, Speakers for output, Webcam for visual context).
*   **Browser Orchestration:** Equip the agent with the ability to manipulate a headed browser (via Playwright or Puppeteer) for local automation tasks.
*   **Dynamic Personas:** Separate persona instructions from the core logic, allowing dynamic loading of distinct behavior profiles at runtime.
*   **Testability:** Build an architecture (e.g., Compound-Engineering / advanced state machines) that isolates the Tool Dispatcher from the network/websocket layer, enabling complete Test-Driven Development (TDD).

## 3. Core Architecture
1.  **Orchestration / Main Loop:** A Node.js/TypeScript (Bun) service or Python backend that maintains the `BidiGenerateContent` WebSocket connection.
2.  **Perception Layer:**
    *   **Audio:** Real-time PCM stream capture via cross-platform bindings (e.g., `PyAudio` or `node-record-lpcm16`/`speaker`).
    *   **Vision:** Webcam frames sampled at ~1 FPS using OpenCV or local WebView to minimize bandwidth while providing continuous visual context.
3.  **Action / Agentic Layer:**
    *   **Tool Dispatcher:** An isolated module that registers and maps Gemini `FunctionCall` requests to local functions.
    *   **Security Sandbox:** Explicit allow/deny lists for directories the agent can read/write and commands it can execute.
    *   **Browser Controller:** Playwright instance for headed browser tasks.
4.  **Persona Manager:** Loads `.json` or `.md` configs containing the `systemInstruction` and preferred Voice configuration to pass into the API's `setup` payload.

## 4. Key Workflows & Features
### A. The Conversation Loop
*   **Trigger:** Wake-word ("Hey Legion") or push-to-talk to minimize API costs and prevent continuous hot-mic eavesdropping.
*   **Execution:** Audio buffers are base64-encoded and sent over WSS. System plays back received base64 chunks seamlessly.

### B. Heuristic Vision
*   Agent can visually interpret the user's environment to describe objects, recognize the user, or read information off physical items held up to the camera.

### C. Local Automation (TDD Focused)
*   **Feature:** `execute_local_command`, `manipulate_browser`, `read_calendar`, `get_tasks`.
*   **TDD Approach:** Every tool must have an isolated unit test demonstrating its success/failure state *without* invoking the Gemini API. Mock responses are used to verify the Orchestrator properly relays `functionResponse` payloads back to the model.

## 5. Deployment & Infrastructure Requirements
*   **Target OS:** Windows 11.
*   **Model:** `gemini-2.0-flash-exp` (or the latest available fast-tier multimodal model).
*   **Dependencies:** Playwright/Puppeteer, WebSocket client, Audio/Video bindings.

## 6. Open Questions / Next Steps
1.  **Wake-word vs. Continuous:** Need to finalize if we use a wake-word engine (like Picovoice Porcupine) or a physical hotkey.
2.  **Persona Schemas:** Define the exact JSON schema for the two personas to be uploaded later.
3.  **Local Security:** Determine the extent of filesystem access allowed (e.g., scoped only to `~/sb/` or full user directory).
