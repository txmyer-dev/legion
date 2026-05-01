# 🔱 Legion

**Legion** is a high-performance, multimodal AI agent framework powered by the **Gemini 2.0 Flash Multimodal Live API**. It is designed for low-latency voice interaction, featuring a secure command execution sandbox and a modular persona system optimized for Windows 11 host environments.

Legion is built on the principle of **Compounding Engineering**: *Each unit of engineering work should make subsequent units of work easier—not harder.*

---

## 🚀 Quick Start

### Prerequisites
- **[Bun](https://bun.sh/)**: The primary runtime for Legion.
- **[SoX](https://sourceforge.net/projects/sox/)**: Required for microphone capture on Windows.
    - Ensure `sox` is in your system `PATH`.
- **Gemini API Key**: Obtain from [Google AI Studio](https://aistudio.google.com/).

### Installation
1. Clone the repository and install dependencies:
   ```powershell
   bun install
   ```

2. Configure environment:
   ```powershell
   copy .env.example .env
   # Add your GEMINI_API_KEY to .env
   ```

3. Run the agent:
   ```powershell
   bun index.ts
   ```

---

## 🏗️ Architecture & Features

### 🎙️ Hardware Abstraction Layer (HAL)
The HAL (`hardware.ts`) isolates OS-specific audio capture and playback. This ensures that the core orchestration logic remains platform-agnostic, enabling seamless operation on Windows 11 while supporting future mocking for TDD.

### 🛡️ Secure Windows Sandbox
Legion includes a robust security boundary (`tools.ts`) for local command execution:
- **Path Validation**: All file operations are constrained to a `SECURE_ROOT` (`C:\Users\txmye_ficivtv\My Drive\sb`) using `path.win32` resolution logic to prevent directory traversal.
- **Command Whitelist**: Only safe commands (e.g., `dir`, `echo`, `cat`) are permitted.

### 🎭 Modular Persona System
Agent identities are not hardcoded. The `personaLoader.ts` dynamically assembles system instructions from modular markdown files in `personas/`, allowing for complex, identity-driven behavior (e.g., the **Ekko** persona).

### ⚡ Bun Integration
Legion leverages Bun's built-in APIs for high performance and reduced dependency overhead, including native `.env` loading and optimized WebSocket handling.

---

## 🧠 Core Philosophy: Compounding Engineering

Legion isn't just a voice assistant; it's a self-improving knowledge system. The repository is structured to capture every decision, solution, and exploration to accelerate future development.

- **`/explore`**: Deep investigation of problems before implementation.
- **`/plan`**: Structured implementation plans for multi-session initiatives.
- **`/compound`**: Documenting successful patterns and solutions in `docs/solutions/`.
- **`/housekeeping`**: Maintaining repository health, auditing state drift, and archiving completed tasks.

See [GEMINI.md](./GEMINI.md) for the full protocol.

---

## 🔧 Customization

### Adding a Persona
Create a new directory in `personas/` with a `CLAUDE.md` and optional sub-directories for `identity`, `rules`, and `telos`. The `personaLoader` will automatically compile these into a unified system instruction.

### Extending Tools
Add new capabilities to the `executeTool` function in `tools.ts` and register their `functionDeclarations` in the `setup` message within `index.ts`.

---

## 📄 License
*Inspired by the Antigravity Compound Engineering Plugin.*
