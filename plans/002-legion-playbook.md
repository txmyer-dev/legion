# Legion Playbook: Phase 2 and Beyond

> Created: 2026-05-01
> Status: Active

## Overview
This document serves as the high-level playbook outlining what has been successfully established in the Legion project so far, and the immediate next steps to elevate it from a bare-bones audio streaming script into a fully-fledged Life Operating System.

---

## 1. What We Have (Current State)

We have successfully established the **Core Bidirectional Audio Infrastructure**:

*   **Stable Live API Connection**: Using the `@google/genai` SDK and the `gemini-3.1-flash-live-preview` model via the `v1alpha` API.
*   **Hardware Abstraction Layer (HAL)**: Overcame Windows native audio dependency issues (Sox/Speaker) by writing robust Python bridges (`audio_capture.py` and `audio_playback.py`) using `pyaudio`.
*   **Full-Duplex Communication**: The `LegionOrchestrator` correctly pushes base64 PCM frames from the microphone directly to Gemini using the newly updated `sendRealtimeInput({ audio: { ... } })` schema and pipes incoming Gemini speech to the speakers.
*   **Persona Integration Framework**: We have a system (`personaLoader.ts`) ready to feed modular, identity-driven system instructions into the WebSocket setup.
*   **Tool Execution Engine**: We have a secure boundary (`tools.ts`) capable of routing function calls (e.g., `execute_local_command`, `get_todo_list`) and returning responses to Gemini in real-time.

---

## 2. What We Need (Next Steps)

Now that the critical pipeline is working, we need to build out the OS features. The following ordered playbook defines where we go next:

### Phase 2: Agent Interruptibility & Session Memory
*   **Barge-in / Interrupt Handling**: Currently, the server handles interruptions, but our local playback queue (`audio_playback.py`) might need to be explicitly flushed when the server indicates `serverContent.interrupted`. We need to gracefully stop the current local playback buffer when the user interrupts the agent.
*   **Session State Logging**: Since this is a Voice OS, conversations are ephemeral. We need a way to transcribe the audio or capture the server's text responses and log them to a markdown file (`docs/logs/`) so the agent has a searchable memory of past interactions.

### Phase 3: Terminal UI & Process Management
*   **Graceful Exit**: We need a way to cleanly exit the application (e.g., catching `Ctrl+C` or listening for a specific "Goodbye" phrase) to kill the background Python processes and close the WebSocket securely.
*   **Visual Feedback**: Enhance `index.ts` to show a clean terminal UI (using standard ANSI escape codes or a library like `ink`) that displays whether Gemini is *listening*, *thinking*, or *speaking*, rather than raw JSON and dots.

### Phase 4: Expanding Capabilities (Tools & Skills)
*   **OS Context Awareness**: Provide the agent with tools to read the current system state, retrieve calendar events, or check the weather.
*   **Compound Engineering Integration**: Give the agent the ability to trigger `/explore` or `/compound` workflows on its own, allowing it to modify its own repository files via voice command.

### Phase 5: The "Always On" Daemon
*   **Wake Word Detection**: Implement a lightweight local wake-word engine (like Porcupine or an optimized local model) so Legion can run as a background service and only open the Gemini Live API connection when summoned, saving API costs and bandwidth.

---

## Conclusion
We have completed **Phase 1** (The Core Pipeline). If you are ready, our next immediate goal should be **Phase 2 (Interrupt Handling & Memory)**, followed by **Phase 3 (Graceful UI/UX)**. 
