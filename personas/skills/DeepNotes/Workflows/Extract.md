# Extract Workflow

Capture comprehensive, chronological notes from any content source.

## Input Sources

| Source | Method |
|--------|--------|
| YouTube URL | **yt-dlp** for transcript (NEVER use WebFetch — youtube.com blocks it) |
| Article URL | WebFetch to get content |
| File path | Read the file directly |
| Pasted text | Use directly |

## Execution Steps

### Step 1: Get the Content

**YouTube URLs (youtube.com, youtu.be, m.youtube.com):**
Do NOT attempt WebFetch — it will always fail. Go directly to yt-dlp:
```bash
yt-dlp --write-auto-sub --skip-download --sub-format vtt \
  -o /tmp/yt-transcript "YOUTUBE_URL" 2>/dev/null
sed '/^$/d; /^[0-9]/d; /^NOTE/d; /^WEBVTT/d; /-->/d' /tmp/yt-transcript*.vtt | \
  awk '!seen[$0]++' > /tmp/yt-transcript.txt
```
Then read `/tmp/yt-transcript.txt` for the transcript. Also grab metadata with:
```bash
yt-dlp --print title --print channel --print description --no-download "YOUTUBE_URL"
```

**For timestamps:** Also save the raw VTT file before stripping timestamps:
```bash
cp /tmp/yt-transcript*.vtt /tmp/yt-timestamps.vtt
```
You'll reference this in Step 2 to correlate content with timestamps.

**Creator attribution:** Use oembed to verify the creator name:
```bash
curl -s "https://www.youtube.com/oembed?url=YOUTUBE_URL&format=json" | python3 -c "import sys,json; print(json.load(sys.stdin)['author_name'])"
```
Never guess creator names from transcript content alone.

**If yt-dlp fails (no transcript):** Fall back to Gemini CLI:
```bash
gemini -p "Transcribe this video completely, preserving all content: YOUTUBE_URL"
```

**Article URLs:** Use WebFetch to get content.
**File paths:** Read the file directly.
**Pasted text:** Use directly.

### Step 2: Structural Scan

Read the entire content without extracting. Produce a mental map:

1. **Topic transitions:** Where does the speaker shift subjects? Note the approximate location and, for video content, the nearest VTT timestamp.
2. **Frameworks:** What named models, frameworks, formulas, or multi-component systems are presented?
3. **Numbers & data:** What specific statistics, dollar amounts, percentages, or timeframes are mentioned?
4. **Quotable moments:** What statements are phrased memorably or with particular emphasis?
5. **Action items:** What does the speaker explicitly recommend doing?

The output of this step is a **section outline** — a list of topic blocks in chronological order with timestamps (if available). This outline becomes the skeleton for Step 3.

### Step 3: Chronological Sectioning

Using the section outline from Step 2, create section headers that:

- Follow the speaker's **actual order** (never reorganize by theme)
- Use the speaker's **own terminology** for section names
- Include `[MM:SS]` timestamps from the VTT data (nearest timestamp to the topic transition)
- Mark topic shifts clearly — when the speaker moves on, start a new section

**Section naming rules:**
- Use what the speaker calls it: "The Value Equation" not "Pricing Framework"
- If the speaker doesn't name a topic, use a descriptive phrase from their language
- Be specific: "Why Agencies Die at $3M ARR" not "Business Growth Challenges"

**Expected section count by depth:**
| Level | Sections |
|-------|----------|
| Quick | 3-5 |
| Standard | 5-10 |
| Deep | 8-20 |

### Step 4: Extract Per Section

For each section, extract **all substantive points**. This is the key difference from ExtractWisdom — you're capturing 90%, not curating 30%.

**What's substantive (include):**
- Core arguments and claims
- Framework components with full detail
- Examples that illustrate a point
- Specific numbers, names, and data
- Tangents that contain useful information (mark as `> **Aside:**`)
- Cause-and-effect chains the speaker builds
- Counterarguments or caveats the speaker raises

**What's not substantive (cut — this is the 10%):**
- Pure small talk, greetings, housekeeping ("make sure to like and subscribe")
- Repeated points stated identically (capture once, at the strongest phrasing)
- Filler transitions ("so anyway", "moving on")
- Self-promotion blocks unless they contain useful context

**Bullet guidelines:**
- 8-30 words per bullet — longer than ExtractWisdom because context matters here
- Include enough context that the bullet teaches by itself
- Use the speaker's words when they're strong
- For frameworks: one bullet per component, with the component's definition and example
- Inline `[MM:SS]` timestamps for key moments (framework introductions, revelations, critical numbers)

**Bullets per section by depth:**
| Level | Bullets/Section |
|-------|----------------|
| Quick | 5-8 |
| Standard | 5-12 |
| Deep | 8-20 |

### Step 5: Compile Reference Sections

After all chronological sections, compile four reference sections:

1. **Key Frameworks & Models** — Every framework from the content, consolidated with full component breakdowns. Use tables for multi-component frameworks. Include the speaker's examples.

2. **Action Items** — Only what the speaker explicitly says to do. No inferences. Format as a checklist.

3. **Numbers & Data Points** — Every specific number, stat, dollar amount, percentage, timeframe. Include context ("$100M in revenue" not just "$100M").

4. **Quotes** — Direct quotes that capture key ideas. Attributed, with brief context.

5. **References & Rabbit Holes** — People, books, tools, companies, URLs, concepts mentioned.

### Step 6: Quality Check

Run the quality checklist from SKILL.md. Specifically verify:
- Could someone reconstruct the talk from these notes? If not, you're missing coverage.
- Are frameworks complete? Check each one has all components, not just the name.
- Is the voice "sharp briefing"? Read 5 random bullets — do they teach, or just summarize?
- Are you in chronological order? Spot-check that sections match the speaker's flow.

### Step 7: Ekko's Take

After the full extraction, write an `## Ekko's Take` section. This is your honest, first-person analysis — not a summary, not cheerleading. Address:

- **What the speaker nails** — what's genuinely good and why
- **Where it hits home for Tony** — connect to his projects, business, infrastructure, goals
- **What's already in our stack** — map claims to things we've built or have
- **What's missing** — gaps this content reveals in our setup
- **Honest critique** — where the speaker oversells, glosses over complexity, or is just wrong
- **Bottom line** — one sentence, no hedging

Tone: direct, opinionated, useful. Write like a trusted advisor, not a book report.

**Ownership rule:** When extractions run via parallel agents, the agents handle parsing + extraction. **Ekko writes the Ekko's Take sections directly** after agents finish — never delegate this to agents.

### Step 8: Output

Present the complete extraction in the format specified in SKILL.md. **File structure order:**

1. YAML frontmatter
2. Title + summary line
3. **Ekko's Take** (FIRST — gives Tony scope before the detail)
4. `---` separator
5. Chronological content sections with timestamps
6. `---` separator
7. Reference sections (Key Frameworks, Action Items, Numbers, Quotes, References)
8. Related

Ekko's Take goes at the top so Tony gets the honest verdict and context mapping before reading the full notes.

### Step 9: Auto-Save to SecondBrain

After presenting output, automatically save to `C:\Users\txmye_ficivtv\My Drive\SecondBrain\Knowledge\`:

1. **Determine filename** using SecondBrain naming conventions:
   - Podcast/show: `{Guest}-{ShowAbbrev}{Episode}.md` (MW, DOAC, JRE, HL, IF, LI)
   - YouTube/general: `{Creator}-{Short-Topic}.md`
   - Book/author: `{Author}-{Short-Title}.md`
   - No dates in filename. No pattern name. Title-Case-With-Hyphens.
   - **Dedup suffix:** If an ExtractWisdom file already exists for the same source, append `-DeepNotes` to the filename (e.g., `Alex-Hormozi-AI-Revolution-DeepNotes.md`)

2. **Check for duplicates** — scan `C:\Users\txmye_ficivtv\My Drive\SecondBrain\Knowledge\` for existing file with same source. Warn if a DeepNotes version already exists. If only an ExtractWisdom version exists, proceed (they're complementary).

3. **Write file** with:
   - YAML frontmatter: title, type (`deep-notes`), domain, tags (2-6 kebab-case), date, source URL, status (`active`)
   - Full extraction output
   - `## Related` section with `[[wiki-links]]` to related existing Knowledge files

4. **Open in Obsidian** — run `start "" "obsidian://open?vault=SecondBrain&file=Knowledge%2F{filename-without-extension}"` to open the file automatically.

5. **Confirm** — state the saved filename and path. No permission needed.
