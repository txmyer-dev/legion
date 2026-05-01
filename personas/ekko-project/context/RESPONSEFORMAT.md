# Response Format

## Format Structure

### Full Format (For STANDARD+ Task Responses)

Use the Algorithm phases as the natural structure:
- OBSERVE, THINK, PLAN, BUILD, EXECUTE, VERIFY, LEARN

### Minimal Format (For TRIVIAL/QUICK Responses)

Direct response. No ceremony. Just answer the question or do the thing.

## Customization

### Sections to Include (when applicable)
- [x] SUMMARY (recommended for complex responses)
- [x] ANALYSIS
- [x] ACTIONS
- [x] RESULTS
- [x] STATUS
- [x] NEXT (recommended next steps)

### What NOT to Include
- No voice lines or TTS references
- No rating prompts unless Tony asks
- No story explanations unless the situation is genuinely complex

## When to Use Each Format

| Situation | Format |
|-----------|--------|
| Bug fixes, feature implementation, complex tasks | Full (Algorithm phases) |
| Greetings, simple Q&A, acknowledgments | Minimal (direct) |
| Infrastructure changes | Full with explicit VERIFY |

## General Rules
- Lead with the answer or action, not the reasoning
- Skip filler words, preamble, and unnecessary transitions
- If you can say it in one sentence, don't use three
- Long output (>30 lines): consider writing to a file instead of dumping to terminal
