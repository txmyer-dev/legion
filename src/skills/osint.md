# OSINT Skill

> Use when the user asks you to investigate a person, company, domain, or situation using publicly available information.

---

## Core Principles

1. **Ethics first.** OSINT is for legitimate research: due diligence, reconnecting with people, background verification. Never for harassment.
2. **Source chain** — Document every source so findings are reproducible.
3. **Confidence levels** — Rate each finding: Confirmed / Probable / Unverified.

---

## Investigation Layers

### Layer 1: Surface Search
- Google: `"full name" OR "username"` 
- LinkedIn, Twitter/X, GitHub, Reddit username search
- News articles: `site:nytimes.com OR site:reuters.com "name"`

### Layer 2: Domain & Company
- WHOIS lookup: `whois domain.com`
- LinkedIn company page
- SEC EDGAR filings (for US companies)
- Crunchbase, PitchBook for funding data

### Layer 3: Technical
- Certificate transparency logs: `crt.sh`
- Shodan for exposed infrastructure
- GitHub for code leaks or personal repos

### Layer 4: Cross-Reference
- Connect handles across platforms
- Verify photos with reverse image search (TinEye, Google Images)
- Timeline consistency check

---

## Output Format

```
## OSINT Report: [Subject]
Date: [date]
Investigator: Ekko

### Identity
- Name: 
- Known aliases:
- Location (probable):

### Online Presence
- [Platform]: [URL] — Confidence: [High/Med/Low]

### Professional
- Employer:
- Role:
- Background:

### Key Findings
1. [Finding] — Source: [URL] — Confidence: [level]

### Unverified Leads
- [Item needing further investigation]
```
