# Offline Fiction - Desktop Writing App

## Overview
An offline-first desktop writing application built with Tauri + React + Rust for longform fiction writing with local LLM assistance. The app enforces style guides, maintains canon, and provides deterministic heuristic analysis plus LLM-powered line editing.

## Recent Changes
- 2025-10-21: Added AI Writing Assistant chat interface at bottom of Scene Editor for conversational help
- 2025-10-21: Added "Get AI Suggestions" button with line-by-line edit approval workflow
- 2025-10-21: Fixed CORS configuration to enable frontend-backend communication
- 2025-10-21: Implemented spell-checking with embedded common words list (~200 words for demo)
- 2025-10-21: Implemented comprehensive prose quality analysis engine with 16+ checks
- 2025-10-21: Added Story Bible data entry forms with character limits and character management
- 2025-10-21: Initial scaffold created with router service, React UI, and JSON schemas

## Architecture

### Monorepo Structure
```
/apps/desktop/          - Tauri + React frontend (Vite dev server)
/core/router/           - Rust Axum HTTP service for heuristics + Ollama integration
/core/indexer/          - Rust SQLite FTS5 indexer (stub for future)
/core/schemas/          - JSON schemas for Style Guide and Edit Results
/scripts/               - Helper scripts for model installation
```

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Zustand (state management)
- **Desktop Shell**: Tauri (local builds only, not on Replit)
- **Backend Service**: Rust + Axum web framework
- **Local LLM**: Ollama on 127.0.0.1:11434
- **Database**: SQLite with FTS5 (future)
- **Version Control**: Git for auto-commits

### Router API Endpoints
- `POST /api/heuristics` - Comprehensive prose quality analysis (15+ checks)
- `POST /api/minor_edit` - LLM-powered minor line edits via Ollama

### Comprehensive Analysis Checks
The deterministic engine performs 15+ quality checks:
1. **Adverbs** - Detects -ly words (with exceptions like "early", "only", "friendly")
2. **Filler words** - really, very, just, quite, actually, basically, literally, etc.
3. **Weak sentence starters** - Then, And, But, So, Well, Now, Also, Still, Yet
4. **Em dashes** - Banned in narration per style guide (ERROR severity)
5. **Weak verbs** - is, was, were, had, has, have, do, does, did, get, got
6. **Clichés** - 30+ common phrases like "at the end of the day", "a matter of time"
7. **Prepositional chains** - 3+ consecutive prepositional phrases
8. **Punctuation** - Double punctuation, missing commas after transition words
9. **Repetitive words** - Same word repeated within a sentence
10. **Sentence pacing** - Long sentences (>35 words), very short sentences, monotonous rhythm
11. **Passive voice** - Detects be-verbs + past participles (including irregular: given, taken, seen, etc.)
12. **Hedging words** - seems, appears, probably, possibly, maybe, perhaps, might
13. **Telling words** - "felt that", "thought that", "realized how", "noticed that"
14. **Conjunction chains** - Too many and/but/or in sequence
15. **Double spaces** - Formatting cleanup

**Severity Levels:**
- **ERROR** (red) - Style guide violations (em-dashes, double punctuation)
- **WARNING** (orange) - Weak prose (adverbs, clichés, passive voice, fillers)
- **INFO** (blue) - Suggestions (pacing, hedging, weak starters, telling)

### Style Guide Enforcement
- No contractions in narration (dialogue may contract)
- No em-dashes in narration
- Configurable tense (past/present) and POV (close-third, first, omniscient)
- Maximum sentence word count

## Project Philosophy
- **Offline-first**: All operations localhost-only except explicit model downloads
- **Canon enforcement**: Edits must cite sources, changes verified against timeline/facts
- **Deterministic + LLM hybrid**: Fast rule checks before slower LLM analysis
- **Git-backed**: Human-readable Markdown/YAML files, auto-commits on edits
- **Single GPU friendly**: Smart queues, one resident model, pause on typing

### Story Bible Features
- **Braindump**: 5000 character limit for freeform ideas
- **Synopsis**: 5000 character summary of the story
- **Outline**: 3000 character plot structure
- **Worldbuilding**: 3000 character setting details
- **Genre**: 50 character genre specification
- **Style Guide**: 2500 character writing style preferences
- **Characters**: Full character management with fields for:
  - Name (required)
  - Character Type (protagonist, antagonist, secondary, support, minor)
  - Description
  - Voice Tone
  - Personality
  - Background
- All sections have character counters that turn red when over limit
- Navigation between sections via clickable sidebar

### Scene Editor Features
- **Prose Analysis**: "Analyze" button runs 16+ deterministic checks for spelling, grammar, style violations
- **AI Suggestions**: "Get AI Suggestions" button generates LLM-powered line-by-line improvements
  - Shows old vs new text in red/green boxes
  - Individual Apply/Reject buttons for each suggestion
  - Respects style guide rules
- **AI Writing Assistant Chat**: Interactive chat interface at bottom of editor
  - Ask questions about your writing ("How can I fix the spelling errors?")
  - Get specific advice and suggestions
  - Context-aware responses based on current text
  - Natural conversation flow with message history
  - Press Enter or click Send to submit messages
- **Issues Panel**: Right sidebar shows color-coded issues (red=errors, orange=warnings, blue=suggestions)
- **Split Layout**: 60% writing area, 40% chat interface for optimal workflow

## Development Notes
- Router runs on port 8000 (changed from 8765 due to Replit restrictions)
- React dev server runs on port 5000
- Ollama expected on port 11434
- All network traffic restricted to 127.0.0.1
- Story Bible data stored in Zustand store (in-memory, persistence pending)
