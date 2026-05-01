# Legion: Master Project Roadmap
> **Status:** Active
> **Goal:** Build a production-ready, always-on, multimodal AI assistant for Windows 11.
> **Philosophy:** Never wonder "what's next." This roadmap defines the exact sequence of implementation from start to ship.

---

## 🟢 Phase 1: The Core Pipeline (COMPLETED)
**Objective:** Establish the foundational real-time connection and basic security sandbox.
- [x] Set up TDD environment and `bun:test` harness.
- [x] Implement path traversal sandbox in `tools.ts` (`C:\Users\txmye_ficivtv\My Drive\sb`).
- [x] Implement shell command whitelist (`dir`, `ls`, etc.).
- [x] Implement dynamic Persona Loader pulling from `~/sb/5ekko`.
- [x] **Task 1.6 (Refactor):** Refactor Persona Loader to enforce explicit `SOUL.md`, `TOOLS.md`, and `AGENTS.md` context separation.
- [x] Establish bidirectional WebSocket connection to Gemini Multimodal Live API.
- [x] Abstract audio I/O using Python `pyaudio` bridges for Windows native support.

---

## 🟢 Phase 2: Conversational UX & State Management (COMPLETED)
**Objective:** Make the voice interactions feel natural, interruptible, and memorable.
- [x] **Task 2.1: Barge-in / Interruptibility.** Handle `serverContent.interrupted` from Gemini by explicitly sending a flush/kill signal to the `audio_playback.py` process to stop the current audio stream instantly when the user interrupts.
- [x] **Task 2.2: Session Transcripts.** Capture the text chunks coming from Gemini's audio responses and save them to a markdown file in `docs/logs/{date}-session.md` to provide long-term conversational memory.
- [x] **Task 2.3: Graceful Exit.** Catch `Ctrl+C` (SIGINT) to properly close the WebSocket, kill the Python audio bridges, and exit cleanly without leaving orphaned background processes.
- [x] **Task 2.4: Terminal UI (TUI).** Implement a clean visual indicator (using `ink` or ANSI escape codes) in the terminal showing the agent's state: 🟢 *Listening*, 🔵 *Thinking*, 🟣 *Speaking*.

---

## 🟡 Phase 3: "Eyes and Hands" (Vision & Browser Orchestration) (CURRENT)
**Objective:** Give Legion the ability to see its environment and manipulate the web.
- [ ] **Task 3.1: Webcam Capture.** Build a Python bridge (`video_capture.py`) using OpenCV to capture a frame from the webcam at ~1 FPS and encode it as a base64 JPEG.
- [ ] **Task 3.2: Vision Integration.** Interleave the webcam base64 frames into the `realtimeInput` payload alongside the audio chunks so Gemini can "see" what is happening.
- [ ] **Task 3.3: Playwright Integration.** Install Playwright and create a `manipulate_browser` tool that allows Gemini to open web pages, click elements, and extract information on behalf of the user.
- [ ] **Task 3.4: Visual Tool Tests.** Write local TDD tests validating browser orchestration and webcam mock frames.

---

## ⚪ Phase 4: OS Integration & Advanced Tools
**Objective:** Deepen the agent's connection to the user's SecondBrain and Windows system.
- [ ] **Task 4.1: Task Backend Integration.** Connect `get_tasks` tool to your actual task management system (Notion, Obsidian, or local markdown).
- [ ] **Task 4.2: Calendar Integration.** Build the `manage_calendar` tool using Google Calendar API.
- [ ] **Task 4.3: Compound Engineering Tools.** Expose tools allowing the agent to trigger `/compound` and `/explore` workflows so it can document its own solutions.
- [ ] **Task 4.4: Image Generation Tool.** Implement the `generate_cartoon_avatar` tool or equivalent image manipulation capabilities.
- [ ] **Task 4.5: Advanced Sandboxing.** Upgrade the basic command whitelist to an `OpenShell` or Docker-based isolation environment for secure local execution.

---

## ⚪ Phase 5: The "Always-On" Gateway & Daemon
**Objective:** Transition from a monolith to a Gateway/Node architecture. Run the heavy Orchestrator on the Linux VPS, and a lightweight background Node natively on Windows 11.
- [ ] **Task 5.1: Gateway/Node Split.** Decouple the local hardware scripts (`pyaudio`/OpenCV) from the Gemini WebSocket Orchestrator. The Windows Node will connect to the Linux Gateway over WebSockets.
- [ ] **Task 5.2: Wake-Word Engine.** Integrate Picovoice Porcupine (or an equivalent local model) with a continuous ring buffer (OpenClaw style) to constantly listen for "We Are Legion" on the Windows Node.
- [ ] **Task 5.3: Hardware Hotkey.** Implement a global Windows shortcut listener to trigger the agent manually without voice.
- [ ] **Task 5.4: Background Service.** Configure the Windows Node to run invisibly as a Windows Service or system tray application, only streaming audio to the Gateway when triggered.

---

## 🚀 Phase 6: Ship & Review
**Objective:** Final audit and release of the "Legion" architecture.
- [ ] **Task 6.1: Security Audit.** Review all exposed tools and sandbox boundaries.
- [ ] **Task 6.2: E2E Playtesting.** Run a full day of productivity purely using Legion for tasks, browser management, and audio interactions.
- [ ] **Task 6.3: Compound Documentation.** Finalize all `/compound` docs describing the architecture.
