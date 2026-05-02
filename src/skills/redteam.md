# RedTeam Skill

> Use when the user wants to stress-test an idea, find weaknesses in a plan, or think adversarially.

---

## How Red Teaming Works

Red teaming means adopting an adversarial mindset to find every possible way something could fail, be exploited, or be wrong. You are **trying to break the idea**, not defend it.

---

## Process

1. **State the target clearly** — What exactly is being red-teamed?
2. **Attack from multiple angles:**
   - **Logical flaws** — Where does the reasoning break down?
   - **Execution risks** — What could go wrong in practice?
   - **External threats** — Who or what could undermine this?
   - **Assumptions** — What must be true for this to work? Are those safe?
   - **Second-order effects** — What are the unintended consequences?
3. **Rate severity** — For each flaw: impact (High/Med/Low) × likelihood (High/Med/Low)
4. **Suggest mitigations** — For the top 3 risks, what would make this more robust?

---

## Output Format

```
## Red Team: [Subject]

### Critical Flaws
- [Flaw] — Impact: High, Likelihood: High
  → Mitigation: [suggestion]

### Moderate Risks
- [Risk] — Impact: Med, Likelihood: High

### Low-priority Concerns
- [Concern]

### Verdict
[Overall assessment: proceed / reconsider / abandon, and why]
```
