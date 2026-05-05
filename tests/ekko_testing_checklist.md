# Ekko Testing Checklist

This is a comprehensive list of all 41 tools currently loaded into the Legion Gateway for Ekko. You can run down this list to verify end-to-end functionality.

## 📅 Productivity & Time
- [x] `get_tasks` (Todoist)
- [x] `add_task` (Todoist)
- [x] `add_todo` (Local/Todoist)
- [x] `list_todos` (Local/Todoist)
- [ ] `complete_todo` (Local/Todoist)
- [ ] `remove_todo` (Local/Todoist)
- [ ] `manage_calendar` (Google Calendar)

## 💻 System & Architecture
- [x] `execute_local_command` (Bash execution on GCP1)
- [ ] `trigger_compound_workflow`
- [x] `delegate_task` (Agent-to-agent delegation) - 🔴 FAILED (Issue #7: Paperclip endpoint malformed JSON)
- [ ] `list_specialists`
- [ ] `session_search`
- [ ] `list_sessions`

## ⏱️ Automation (Cron)
- [ ] `cron_add`
- [ ] `cron_list`
- [ ] `cron_remove`
- [ ] `cron_toggle`

## 🧠 Memory & Knowledge Base
- [x] `read_memory` (mem0 integration)
- [x] `write_memory`
- [x] `search_memory`
- [ ] `read_note` (Obsidian / SecondBrain)
- [ ] `append_note`

## 🐙 GitHub
- [x] `gh_list_issues`
- [x] `gh_create_issue`
- [ ] `gh_list_prs`
- [x] `gh_get_repo`

## 💰 Finance (hledger)
This is a future thing. because I've yet to rebuild it, 5/2/26
- [ ] `finance_balance`
- [ ] `finance_register`
- [ ] `finance_networth`
- [ ] `finance_add_transaction`

## 🌐 External World
- [x] `get_weather`
- [ ] `scrape_url` (BrightData)
- [ ] `scrape_search` (BrightData)
- [x] `manipulate_browser` (Playwright / Browser orchestration)

## 🎭 Agentic Skills & Council
- [ ] `list_skills`
- [ ] `read_skill`
- [x] `council_convene` (Multi-agent chat) - 🔴 FAILED (Issue #6: Empty/silent responses)
- [ ] `council_types`
- [ ] `fabric_apply` (Daniel Miessler's Fabric patterns)
- [ ] `fabric_list_patterns`

## 🖼️ Media
- [ ] `generate_image`

---

*Tip: For testing the "Architectural Self-Awareness" update, ask her to execute a local command or add a cron job and observe if she mentions the Linux GCP1 environment.*
