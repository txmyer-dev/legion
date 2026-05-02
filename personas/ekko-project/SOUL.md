# TELOS — Tony's Life Operating System

> The central hub for everything I'm building toward. Not a productivity system — a life system.

Ekko knows what Tony is actually trying to achieve, not just what he typed today.

## Current State (2026)

- **Professional:** Full-time W2 + building SNAP consulting on the side
- **Business:** Single product — $5K SNAP Build Sessions
- **Infrastructure:** Ekko operational (Legion gateway, 41 tools, skills layer, persistent memory)
- **Personality:** ENTP-A — biggest asset (ideas, improvisation) and biggest risk (scattered focus, novelty addiction)
- **Rule:** Don't quit the W2 until consulting revenue hits 75% of salary for 3 consecutive months (~$7.5K/month)

---

# MISSION

> Build calm, opinionated systems for people who don't have time to think about systems.

I'm not inventing a framework. Daniel Miessler invented SNAP. I mastered the **implementation** — what took me months of experimentation, the client gets in one afternoon.

The world is splitting into two groups: people who have AI infrastructure and people who don't. The gap compounds monthly.

**Identity:** Implementation expert, not a thought leader. Excellent for the 12–50 people a year who walk away with a working system.

---

# GOALS

## This Quarter
- Complete first paid SNAP Build Session
- Document session into a repeatable playbook
- Populate remaining Telos files and use daily with Ekko

## This Year (2026)
- Hit 75% rule: ~$7.5K/month sustained for 3 months
- 12 Build Sessions = $60K on ~60 hours delivery
- SNAP Build Session fully repeatable with <1 hour prep per client

## Long Term
- Full-time SNAP consulting — W2 is gone
- Upsell menu built from real demand (heartbeat, n8n, custom skills, VPS)
- Referral-driven growth, not content marketing

---

# ACTIVE PROJECTS

| Project | Status | Priority |
|---------|--------|----------|
| SNAP Build Session | Defining MVP | #1 — this is the business |
| Ekko / Legion | Operational | #2 — the engine |
| SecondBrain | Active and growing | #3 — the knowledge layer |

**SNAP Build Session:** $5K for a 4–5 hour session. Client walks away with working Personal AI Infrastructure. 95% margin.

---

# STRATEGIES

1. **One Product, One Price** — $5K. No tiers. Kill optionality.
2. **Consulting IS the Business** — Tier 1 is the destination, not the on-ramp. $5K × 12 = $60K on 60 hours.
3. **Eat My Own Cooking** — Every component gets used by me first. The infrastructure IS the demo.
4. **The 75% Rule** — Math, not feelings. Don't quit until the number is sustained.
5. **Borrowed Discipline** — Hormozi for selling (volume), Rohn for environment (association), Sivers for systems (good enough).
6. **Build for People I Love Being Around** — $5K filters for serious technical leaders who implement.

---

# REFERENCE

Deeper context lives in Ekko's memory and can be read on demand:
- Use `read_memory` with section "Beliefs", "Wisdom", "Frames", "Models", "Lessons", "Challenges" for full philosophical context
- Full Telos vault lives outside this repo — will be connected when available

## Environment / Secrets

Canonical secrets file: `personas/ekko-project/.env`

This is the **only** `.env` that needs to be maintained. It is loaded first at boot, before the project root and `~/.env` fallbacks. Add all API keys here — do not scatter them across multiple `.env` files.

This file is gitignored.
