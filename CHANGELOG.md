# Changelog

## [Unreleased] - 2026-05-02

### ✨ Features
- centralize secrets to personas/ekko-project/.env (7a6f33e)
- Phase 3+4 complete — brightdata, fabric, council, delegate, session_search (353dadd)
- Phase 2 complete — todo, cron, github, hledger plugins + 1008 fix (a76d973)
- add memory system, skills layer, and skill plugins (3b3fa0c)
- enable native google search tool (23eeab4)
- implement dynamic gateway routing, harden path validation, and finalize gui (2963399)
- complete Phase 5 with Always-On Gateway/Node architecture, Picovoice wake-word, and global hotkeys (84a9b26)
- complete Phase 4 OS Integration & Advanced Tools (696e5e4)
- complete Task 4.1 with Todoist and Obsidian integration (973872c)
- phase 3 completion, vision and playwright browser orchestration (3e8d46c)
- complete Phase 2 with graceful exit, TUI, session logs, and barge-in support (d22b2e5)

### 🐛 Bug Fixes
- **plugins:** correctly parse results array from v1 Todoist API (2de5a46)
- **plugins:** update todoist plugin to use v1 API and correct env var name (2abfc18)
- align node.ts env loading to persona .env (85b3757)
- load only personas/ekko-project/.env — no fallbacks (2d6ba23)
- resolve tool call crashes and add custom weather tool (933be57)
- load global env and add camera index support (5987637)
- bundle electron gui to prevent module not found (0e97847)

### 📚 Documentation
- update roadmap with openclaw gateway architecture and sandboxing (0c23a67)
- create end-to-end master roadmap (e20c773)
- compound solution for hardware decoupling (964b46c)
- redesign README.md for grandeur and Life OS theme (1188043)
- compound knowledge for sandbox and persona loader (1033c4c)

### ♻️ Refactoring
- migrate monolithic tools to plugin architecture (Phase 1) (126e21f)

### 🧪 Testing
- implement MockHardwareLayer and TDD coverage for Orchestrator (62545cd)

### 🔧 Maintenance
- rename package from jasper-ai to legion (b880acc)
- trim persona system prompt from ~1200 to ~400 lines (3c75aa8)
- remove sox-bin and dead PATH injection (0816b14)
- fix lint and update roadmap (146426a)
- finalize repository housekeeping and fix docs validation (499abff)

### Other Changes
- Restructure project into src, tests, python, and scripts folders. Fix Bidi API tool calling support. (deb3572)
- Update codebase, add python audio scripts and plans (4b10a33)
- Implement TDD sandbox, command whitelist, and persona loader (cc71b04)
- Create initial setup and TDD integration plan (bf9015b)
- Initialize Compound Engineering framework (1075f5a)
- Update PRD with trigger/security decisions and import 5ekko persona schema (facd22a)
- Initial commit: Scaffold Legion design and initial codebase (480df49)

All notable changes to this project will be documented in this file.

