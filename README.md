---

<div align="center">

# 🔱 Legion

<br/>

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&weight=500&size=24&pause=1000&color=60A5FA&center=true&vCenter=true&width=600&lines=The+High-Performance+Multimodal+AI+Framework.;Your+Life+Operating+System.;Powered+by+Gemini+2.0+Flash.)](https://github.com/txmye/Legion)

<br/>

<!-- Tech Stack -->
[![Built with Gemini](https://img.shields.io/badge/Built_with-Gemini-4285F4?style=flat&logo=google&logoColor=white)](https://aistudio.google.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-000000?style=flat&logo=bun&logoColor=white)](https://bun.sh)
[![Linux (GCP1)](https://img.shields.io/badge/Linux-FCC624?style=flat&logo=linux&logoColor=black)](https://ubuntu.com)
<br/>

**Overview:** [Purpose](#the-purpose-of-legion) · [What is Legion?](#what-is-legion) · [Principles](#the-legion-principles) · [Primitives](#legion-primitives)

**Get Started:** [Installation](#-installation) · [Architecture](#-architecture)

---

</div>

> [!IMPORTANT]
> **Legion — Life Operating System** — A high-performance, multimodal AI agent framework powered by the **Gemini 2.0 Flash Multimodal Live API**. It is designed for low-latency voice interaction, featuring a secure command execution sandbox, hotkey-based activation (`Ctrl+Shift+L`), and a modular persona system optimized for Linux (GCP1) host environments.

<div align="center">

# Compounding Engineering: Make tomorrow easier.
</div>

**Legion's core mission is to embody Compounding Engineering:**

*Each unit of engineering work should make subsequent units of work easier—not harder.*

Legion isn't just a voice assistant; it's a self-improving knowledge system. The repository is structured to capture every decision, solution, and exploration to accelerate future development.

---

## 🏛️ The Legion Principles

These principles guide how Legion is designed and built:

| # | Principle | Summary |
|---|-----------|---------|
| 1 | **Compounding Engineering** | Every task solved today must be documented and codified so it never has to be solved again tomorrow. |
| 2 | **Validation-First** | Automated checks and strict adherence to protocols are the primary gates for repository health. |
| 3 | **Secure by Default** | All local command execution is strictly sandboxed. |
| 4 | **Identity Modularity** | Agent identities are modular, decoupled, and dynamically assembled. |

---

## ⚙️ Legion Primitives

Legion's architecture relies on core primitives that make it function as a unified Life OS rather than a disjointed toolset.

### 🎙️ Hardware Abstraction Layer (HAL)
The HAL (`src/hardware.ts`) isolates OS-specific audio and video capture using Python sub-processes (`pyaudio` and OpenCV). This ensures the core orchestration logic remains modular. A Python-based hotkey listener triggers the system manually (`Ctrl+Shift+L`).

### 🛡️ Secure Command Sandbox
Legion includes a robust security boundary for local command execution (`src/plugins/system.ts`):
- **Path Validation**: File operations are securely constrained.
- **Command Execution**: Only verified and user-approved bash commands are executed locally.

### 🎭 Modular Persona System
Agent identities are not hardcoded. The `personaLoader.ts` dynamically assembles system instructions from modular markdown files in `personas/` (such as `identity`, `rules`, and `telos`). This allows for complex, identity-driven behavior.

### 🔄 The Compounding Engine
The core loops of Legion:
- **`/explore`**: Deep investigation of problems before implementation.
- **`/plan`**: Structured implementation plans for multi-session initiatives.
- **`/compound`**: Documenting successful patterns and solutions in `docs/solutions/`.
- **`/housekeeping`**: Maintaining repository health, auditing state drift, and archiving completed tasks.

See [GEMINI.md](./GEMINI.md) for the full protocol.

---

## 🚀 Installation & Quick Start

### Prerequisites
- **[Bun](https://bun.sh/)**: The primary runtime for Legion.
- **Python 3.10+**: Used for the hardware layer and hotkey detection (with `pyaudio`, `opencv-python`, `keyboard`).
- **Google Cloud Account**: Required for GCP Secret Manager.

### Setup

```bash
# 1. Clone and install dependencies
bun install

# 2. Configure environment (Single-Secret JSON Pattern)
# Create a secret named `LEGION_EKKO_SECRETS` in GCP Secret Manager containing:
# { "GEMINI_API_KEY": "...", "GITHUB_TOKEN": "...", "TODOIST_API_TOKEN": "..." }
# Ensure you are authenticated via `gcloud auth application-default login`

# 3. Launch the Legion Gateway (Orchestrator)
bun run start:gateway

# 4. In a new terminal, launch the Legion Node (Hardware/Audio)
bun run start:node
```

---

## 🔧 Customization

### Adding a Persona
Create a new directory in `personas/` with a `AGENTS.md`, `SOUL.md`, and optional configurations. The `personaLoader` will automatically compile these into a unified system instruction.

### Extending Tools
Add new capabilities by creating a new plugin in the `src/plugins/` directory and exporting a `LegionPlugin` interface. Register your plugin by adding it to the exported array in `src/plugins/index.ts`.

---

<div align="center">

**Inspired by the Antigravity Compound Engineering Plugin & Daniel Miessler's PAI.**

</div>

