---
date: "2026-05-01"
problem_type: "test_failure"
severity: "high"
symptoms:
  - "Unit tests fail to execute in environments without native audio bindings."
  - "Test suite hangs or throws binding errors (`speaker`, `node-record-lpcm16`) when initializing the application entry point."
root_cause: "process_issue" # (Closest match - essentially hardcoded native dependencies lacking interface abstraction)
component: "unit_test"
tags:
  - tdd
  - hardware-abstraction
  - dependency-injection
  - testing
  - native-bindings
related_solutions: []
last_referenced: "2026-05-01"
---

# Decoupling Hardware Dependencies for Test-Driven Development

## Context
The Legion system relies on native hardware bindings (e.g., `speaker`, `node-record-lpcm16`) to interact with the host machine's audio devices. Initially, these imports and instantiations were hardcoded at the top level of `hardware.ts` and tightly coupled to the main orchestration loop in `index.ts`. 

## Problem
When attempting to introduce a Test-Driven Development (TDD) workflow by writing tests for the main orchestration logic, the test suite (`bun test`) would fail immediately or hang. This occurred because the test environment often lacks the necessary native audio hardware or drivers, and the imports were evaluated immediately upon loading the modules, preventing any mocked or headless execution.

## Solution
To achieve a production-ready, testable architecture, we decoupled the hardware implementation from the core orchestration logic:

1. **Hardware Abstraction Layer (HAL):**
   - We refactored `hardware.ts` to implement a `MockHardwareLayer` that simulates audio input/output without requiring actual hardware.
   - We updated the native `PlatformHardwareLayer` to use **lazy-loading** (using `require()` inside the method scope) instead of top-level `import` statements for `speaker` and `node-record-lpcm16`. This ensures native modules are only evaluated when explicitly invoked.

2. **Orchestrator Extraction:**
   - We extracted the core Gemini WebSocket orchestration loop from `index.ts` into a new, injectable `LegionOrchestrator` class (`orchestrator.ts`).
   - The orchestrator accepts an abstract hardware interface during instantiation, allowing tests to inject the `MockHardwareLayer`.

## Result
This pattern completely insulates the core business logic from environmental constraints. The test suite can now rapidly and reliably verify the initialization sequence, audio routing, and function-call handling without invoking any actual audio devices.

## Lessons Learned
- **Lazy Loading Native Modules:** In Node/Bun, top-level imports of native bindings will fatally break environments that don't support them. Always defer loading native hardware dependencies until execution time.
- **Inversion of Control:** Core orchestration logic must never directly instantiate external side-effects (hardware, network). They must be provided to the orchestrator to enable unit testing.
