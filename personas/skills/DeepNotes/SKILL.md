---
name: DeepNotes
description: Comprehensive chronological note-taking that captures 90% of content. Sibling to ExtractWisdom. USE WHEN deep notes, comprehensive notes, full notes, detailed notes, take notes, capture everything, full breakdown, workshop notes, lecture notes, don't miss anything.
---

## Customization

**Before executing, check for user customizations at:**
`~/.claude/skills/SNAP/USER/SKILLCUSTOMIZATIONS/DeepNotes/`

If this directory exists, load and apply any PREFERENCES.md, configurations, or resources found there. These override default behavior. If the directory does not exist, proceed with skill defaults.

# DeepNotes — Comprehensive Content Capture

**The sibling to ExtractWisdom.** ExtractWisdom curates the best 30% — opinionated, reorganized, conversational. DeepNotes captures the substantive 90% — chronological, complete, teaches-from-notes quality.

Use ExtractWisdom when you want the gems. Use DeepNotes when you need to reference the whole thing later.

## When to Use

- Dense workshops, lectures, tutorials where every framework matters
- Content you'll reference repeatedly (Hormozi workshops, technical deep dives)
- User says "deep notes", "take notes", "capture everything", "don't miss anything"
- When 30% curation would lose critical context

## When NOT to Use — Use ExtractWisdom Instead

- Quick podcast summaries ("what's interesting in this?")
- Content where the best 5 ideas are all you need
- User says "extract wisdom", "key takeaways", "what's worth knowing"

## Depth Levels

Default is **Deep** if no level is specified.

| Level | Sections | Bullets/Section | Reference Sections | When |
|-------|----------|----------------|-------------------|------|
| **Quick** | 3-5 | 5-8 | Numbers & Data only | Fast capture. Major topics only. |
| **Standard** | 5-10 | 5-12 | All three | Solid coverage. Most use cases. |
| **Deep** | 8-20 | 8-20 | All three + full framework tables | The default. Nothing substantive missed. |

**How to invoke:** "deep notes (quick)" or "take deep notes at standard level" or just "deep notes" for Deep.

**All levels use the same voice and quality standards.** Only coverage changes.

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **Extract** | "deep notes on", "take notes on", YouTube URL + deep notes | `Workflows/Extract.md` |

## The Core Idea

ExtractWisdom asks: "What's worth telling someone about?"
DeepNotes asks: "What would I need to reconstruct this talk from my notes?"

Follow the speaker's actual flow. Use their terminology for section names. Preserve every framework with all its components. Keep every number, name, and specific claim. The output should feel like sitting in the room with a sharp note-taker — someone who captures everything substantive but still writes clearly.

## Voice Rules (CRITICAL)

**Canonical voice reference: `skills/SNAP/USER/WRITINGSTYLE.md`** — read this file for the full voice definition. DeepNotes voice is a "sharp briefing" — precise, specific, teaches-from-notes quality. Not a coffee chat (that's ExtractWisdom). Not dry documentation either.

**THREE LEVELS — we're aiming for Level 3:**

**Level 1 (BAD — dry lecture notes):**
- The speaker discussed the four components of a compelling offer: dream outcome, perceived likelihood of achievement, time delay, and effort/sacrifice
- A framework for customer acquisition was presented involving lead magnets and conversion mechanisms
- The importance of pricing strategy in relation to perceived value was emphasized

**Level 2 (BETTER — organized summary):**
- Four components of a Grand Slam Offer: dream outcome, perceived likelihood, time delay, effort/sacrifice
- Lead magnets should solve a narrow problem completely, creating reciprocity and demonstrating capability
- Price is not about cost — it's about the gap between price and perceived value

**Level 3 (YES — sharp briefing, teaches from notes):**
- Grand Slam Offer has four levers: increase dream outcome, increase perceived likelihood of achievement, decrease time delay, decrease effort/sacrifice. All four move the value equation — price stays the same, value goes up.
- Lead magnets work because they solve one narrow problem completely. The customer thinks "if the free thing is this good, what's the paid thing like?" That's the conversion mechanism — reciprocity plus demonstrated capability.
- The pricing insight: don't lower price, raise value. A $100K offer that solves a $1M problem is cheap. A $10 ebook that solves nothing is expensive. Price is the gap, not the number.

**Key voice differences from ExtractWisdom:**
- ExtractWisdom: casual, "over coffee" — can skip context because it's curating gems
- DeepNotes: precise, "sharp briefing" — includes enough context that you could teach from these notes
- Both are human and specific. Neither is academic or dry.

## Structural Rules

1. **Chronological fidelity:** Sections follow the speaker's actual order, not reorganized by theme
2. **Speaker's terminology:** Use the speaker's names for concepts, frameworks, and sections — don't rename them
3. **Tangents as asides:** If the speaker goes off-topic, capture it in an `> **Aside:**` blockquote within the current section
4. **No merging:** Don't combine topics that the speaker covered separately, even if they're related
5. **Transitions noted:** When the speaker shifts topics, start a new section — don't blend

## Framework Capture Rules

Frameworks are the highest-value content in DeepNotes. Capture them completely:

1. **All components:** Every piece of the framework, not just the headline
2. **Visual structure:** Use tables, numbered lists, or formulas — match how the speaker presents it
3. **Speaker's examples:** Include the examples they use to illustrate each component
4. **Relationships:** How components connect, sequence, or depend on each other
5. **The "so what":** Why the speaker says this framework matters

## Timestamp Rules

- **Section headers:** Include `[MM:SS]` from the nearest VTT timestamp at the topic transition
- **Key moments:** Inline `[MM:SS]` for particularly important statements, revelations, or framework introductions
- **Source:** Timestamps come from VTT subtitle data only — never estimate or fabricate
- **No timestamps available:** When processing articles or pasted text, omit timestamps entirely. Do not note their absence.

## Output Format

```
---
YAML frontmatter
---

# {Speaker} — {Content Title}

{1-2 sentence description of what this content covers and why it matters}

## Ekko's Take

{2-3 paragraph personal analysis — FIRST, before any content sections}

---

## {Topic 1} [MM:SS]

- {substantive point with full context}
- {framework component with relationships}
- ...

## {Topic 2} [MM:SS]

- ...

---

## Key Frameworks & Models

{Consolidated list of all frameworks mentioned, with full component breakdowns in tables or structured lists}

## Action Items

{Explicit recommendations, steps, or things the speaker says to do — only what's actually stated, not inferred}

## Numbers & Data Points

{Every specific number, statistic, dollar amount, percentage, timeframe mentioned}

## Quotes

{Direct quotes that capture key ideas — attributed, with context}

## References & Rabbit Holes

{People, books, tools, companies, concepts mentioned worth looking up}

## Related

{[[wiki-links]] to existing SecondBrain files}
```

## Quality Checklist

Before delivering, verify:

- [ ] **Completeness:** Could someone who missed the talk reconstruct the key arguments from these notes?
- [ ] **Framework integrity:** Are ALL frameworks captured with every component, not just named?
- [ ] **Chronological order:** Do sections follow the speaker's actual flow?
- [ ] **Speaker's words:** Are section names and concept names the speaker's terminology?
- [ ] **Numbers preserved:** Are ALL specific numbers, stats, and data points captured?
- [ ] **Quotes included:** Are the most impactful direct quotes captured?
- [ ] **Action items explicit:** Are recommendations listed as stated, not inferred?
- [ ] **No drift to ExtractWisdom:** Is the voice "sharp briefing" not "coffee chat"?
- [ ] **Ekko's Take is first:** Immediately after title line, before content sections?
- [ ] **Timestamps present:** Section headers have `[MM:SS]` (for video/audio content)?
