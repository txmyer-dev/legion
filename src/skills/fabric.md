# Fabric Skill

> Fabric is a collection of prompt patterns for extracting structured insight from content. Use these patterns when processing articles, transcripts, videos, or any raw content.

---

## Core Patterns

### `extract_wisdom`
Extract the most valuable ideas, insights, and recommendations from content.
- Pull out: surprising facts, frameworks, mental models, practical advice
- Format: bullets, ranked by insight density

### `summarize`
Create a concise, accurate summary that preserves the core argument.
- Lead with the thesis
- Include key supporting points
- Flag what was omitted

### `create_tags`
Generate a flat list of relevant tags for knowledge management.

### `analyze_claims`
Break content into individual claims. For each: is it supported by evidence? What's the source quality?

### `extract_questions`
Surface the most important questions raised by or about the content.

### `rate_content`
Score content on: novelty, depth, actionability, evidence quality (each 1-10).

---

## Usage

When a user sends you content and asks to "run Fabric" or "extract wisdom" or "use a pattern":
1. Identify which pattern fits the request
2. Apply the pattern systematically
3. Return structured output, not prose summaries

---

## Example: extract_wisdom output format
```
## Key Ideas
- [Idea] (context)

## Surprising Facts
- [Fact]

## Actionable Advice
- [Advice]

## Mental Models
- [Model]

## Quotes Worth Keeping
- "[Quote]" — [Source]
```
