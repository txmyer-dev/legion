---
date: "2026-05-02"
problem_type: "integration_issue"
component: "third_party_api"
severity: "medium"
symptoms:
  - "Todoist plugin integration failing"
  - "Todoist API error or missing tasks array"
root_cause: "api_contract_changed"
tags:
  - todoist
  - rest-api
  - v2
related_issues: []
---

# Problem Statement
The Todoist integration plugin (`src/plugins/todoist.ts`) was failing because it was using the deprecated `api/v1` endpoint. Additionally, it assumed the response returned an object with a `results` array, which was incorrect for the REST API endpoint.

# Symptoms Observed
- Todoist API plugin failing to retrieve or add tasks.
- Issue #3: "Todoist Plugin Integration Failing"

# Investigation Steps
- Reviewed `src/plugins/todoist.ts` and noticed the endpoint `https://api.todoist.com/api/v1/tasks`.
- Checked Todoist Developer Documentation for REST API v2 (`/rest/v2/tasks`).
- Confirmed that `GET /rest/v2/tasks` returns a JSON array of tasks, not an object with a `results` property.

# Root Cause Analysis
- `api_contract_changed`: Todoist REST API v1 was deprecated/removed, and v2 returns a direct JSON array for the `GET /tasks` endpoint.

# Working Solution
- Updated the fetch endpoints in `src/plugins/todoist.ts` from `api/v1/tasks` to `rest/v2/tasks`.
- Updated the response parsing to expect an array: `const tasks = await response.json() as any[];` instead of extracting `data.results`.

# Prevention Strategies
- Regularly check API deprecation warnings for third-party services.
- Write integration tests to catch API contract changes early.
