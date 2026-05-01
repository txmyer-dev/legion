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
[![Windows 11](https://img.shields.io/badge/Windows-0078D6?style=flat&logo=windows&logoColor=white)](https://windows.com)

<br/>

**Overview:** [Purpose](#the-purpose-of-legion) · [What is Legion?](#what-is-legion) · [Principles](#the-legion-principles) · [Primitives](#legion-primitives)

**Get Started:** [Installation](#-installation) · [Architecture](#-architecture)

---

</div>

> [!IMPORTANT]
> **Legion — Life Operating System** — A high-performance, multimodal AI agent framework powered by the **Gemini 2.0 Flash Multimodal Live API**. It is designed for low-latency voice interaction, featuring a secure command execution sandbox and a modular persona system optimized for Windows 11 host environments.

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
The HAL (`hardware.ts`) isolates OS-specific audio capture and playback. This ensures that the core orchestration logic remains platform-agnostic, enabling seamless operation on Windows 11 while supporting future mocking for Test-Driven Development (TDD).

### 🛡️ Secure Windows Sandbox
Legion includes a robust security boundary (`tools.ts`) for local command execution:
- **Path Validation**: All file operations are constrained to a `SECURE_ROOT` using `path.win32` resolution logic to prevent directory traversal.
- **Command Whitelist**: Only safe, verified commands are permitted.

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
- **[SoX](https://sourceforge.net/projects/sox/)**: Required for microphone capture on Windows. Ensure `sox` is in your system `PATH`.
- **Gemini API Key**: Obtain from [Google AI Studio](https://aistudio.google.com/).

### Setup

```powershell
# 1. Clone and install dependencies
bun install

# 2. Configure environment
copy .env.example .env
# Add your GEMINI_API_KEY to .env

# 3. Launch the Legion Daemon
bun index.ts
```

---

## 🔧 Customization

### Adding a Persona
Create a new directory in `personas/` with a `CLAUDE.md` and optional sub-directories for `identity`, `rules`, and `telos`. The `personaLoader` will automatically compile these into a unified system instruction.

### Extending Tools
Add new capabilities to the `executeTool` function in `tools.ts` and register their `functionDeclarations` in the `setup` message within `index.ts`.

---

<div align="center">

**Inspired by the Antigravity Compound Engineering Plugin & Daniel Miessler's PAI.**

</div>

