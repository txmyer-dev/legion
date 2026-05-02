# Source Code

## Purpose
This directory contains the main source code for the Legion agent application.

## Components
- **`plugins/`**: Integrations with external services (Todoist, Google Calendar, etc.).
- **`skills/`**: Agent skills and capabilities.
- **`gateway.ts`**: API gateway logic.
- **`gui.ts`**: Graphical user interface components.
- **`hardware.ts`**: Hardware abstraction layer.
- **`node.ts`**: Background node execution.
- **`orchestrator.ts`**: Core logic orchestrator.
- **`wake_word.ts`**: Picovoice wake word engine.
- **`calendar.ts`**: Google Calendar integration.
- **`logger.ts`**: Logging utility.
- **`index.ts`**: Entry point.
- **`browser.ts`**: Browser automation.
- **`personaLoader.ts`**: Loads persona configurations.
- **`skillLoader.ts`**: Loads skills dynamically.

## Component Details
### `gateway.ts`
Manages external API interactions.

### `orchestrator.ts`
Coordinates different modules.

### `wake_word.ts`
Listens for the wake word using Picovoice Porcupine.

## Changelog
### 2026-05-02
- Created `README.md`.
