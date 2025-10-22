# Offline Fiction - Desktop Writing App

## Overview
An offline-first desktop writing application built with Tauri + React + Rust for longform fiction writing with local LLM assistance. The app enforces style guides, maintains canon, and provides deterministic heuristic analysis plus LLM-powered line editing.

## Recent Changes
- 2025-10-22: Automatic background summary generation when chapters are saved (invisible to user, purely for AI context)
- 2025-10-22: Added Story Bible context to all AI chat queries (genre, synopsis, outline, worldbuilding, style guide, characters)
- 2025-10-22: Added previous chapter summaries to chat context to avoid token limits
- 2025-10-22: Chat now includes full Story Bible + previous chapter summaries + current chapter content
- 2025-10-22: Removed Copy Editor Critique button, replaced with Chapter Response text window for chat-based chapter interaction
- 2025-10-22: Chat responses now appear in dedicated text window in Editor Controls section
- 2025-10-22: Simplified UI: removed critique popup and inline highlighting system
- 2025-10-21: Implemented intelligent automatic model selection based on chat prompts
- 2025-10-21: Enhanced "Analyze" button to flag issues AND suggest AI corrections
- 2025-10-21: Removed separate "Get AI Suggestions" and "Major Rewrite" buttons (auto-switching handles this)
- 2025-10-21: Added `/api/chat` endpoint for conversational AI assistance
- 2025-10-21: Implemented three-tier AI model system (small/medium/large) with configurable settings
- 2025-10-21: Added resizable left pane with drag handle for Story Bible navigation
- 2025-10-21: Added AI Writing Assistant chat interface for conversational help
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
- `POST /api/heuristics` - Comprehensive prose quality analysis (16+ checks)
- `POST /api/minor_edit` - LLM-powered line-by-line edits via Ollama
- `POST /api/chat` - Conversational AI assistant with automatic model selection

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

### Chapters (above Story Bible)
- **Chapter Management**: Organize and track your book's chapters
  - **Chapter Number**: Numeric ordering (auto-sorts by number)
  - **Title**: Chapter title/name
  - **Summary**: Brief synopsis of what happens in the chapter
  - **Word Count**: Track chapter length
  - **Status**: Visual progress tracking
    - Planned (gray) - Chapter outlined but not written
    - Draft (orange) - First draft in progress or complete
    - Revised (blue) - Revisions completed
    - Final (green) - Ready for publication
  - **Color-coded status bar**: Left border shows chapter status at a glance
  - **Add/Edit/Delete**: Full CRUD operations for chapter management
  - Chapters sort automatically by chapter number

### Story Bible Features
- **Braindump**: 5000 character limit for freeform ideas
- **Synopsis**: 5000 character summary of the story
  - **Generate Outline button**: AI-powered outline creation from synopsis
  - Uses medium model to create structured plot outline with acts and key scenes
  - Automatically fills the Outline section and navigates to it
  - Disabled until synopsis has content
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

### Chapter Editor Layout
- **Three-section layout:**
  - **Left Sidebar**: Story Bible navigation with resizable drag handle (200-500px)
    - Active chapter display at top with integrated Save button
    - Chapter Response text window showing chat feedback
  - **Main Area**: Chapter Editor for writing individual chapter content (full height)
  - **Bottom**: AI Writing Assistant chat prompt line

### Chapter Editor Features
- **Individual Chapter Storage**: Each chapter stores its own content separately
  - Click any chapter in the Chapters section to load it in the editor
  - Active chapter highlighted with blue border in chapter list
  - Automatically navigates to editor when chapter is clicked
  - Chapter title shown in editor header (e.g., "Chapter 1: The Beginning")
  
- **Save Button**: Integrated into active chapter box for quick access
  - Appears in top-right of active chapter display
  - Saves current chapter content and recalculates word count
  - **Automatically generates invisible summary** in background using small model
  - Summaries are hidden from user - purely for AI context
  - Previous chapter summaries included in AI queries (avoids sending full text)
  - Essential for maintaining plot consistency without hitting token limits
  - Shows success confirmation when saved

- **Chapter Response Window**: Dedicated text display for AI feedback about your chapter
  - Located in Editor Controls section (left sidebar)
  - Shows real-time chat responses about your writing
  - Scrollable text area (200-400px height)
  - Displays model used (small/medium/large) with each response
  - Automatically updates when you ask questions via AI Assistant
  - Clears when switching chapters
  
- **AI Writing Assistant**: Bottom chat bar spanning full width with comprehensive context
  - Ask questions about your writing ("How can I make this chapter better?", "What issues do you see?")
  - **Full Story Bible context included** with every query:
    - Genre, synopsis, outline, worldbuilding, style guide
    - All character details (descriptions, personalities, voice tones, backgrounds)
  - **Previous chapter summaries** (not full text) for continuity
  - Current chapter content
  - **Intelligent automatic model selection** based on your prompt:
    - Simple questions/explanations → Small model (fast)
    - Fix/improve/edit requests → Medium model (balanced)
    - Rewrite/regenerate/transform → Large model (highest quality)
  - Responses appear in Chapter Response window (left sidebar)
  - Shows which model was used with each response
  - Press Enter or click Ask to submit questions

## Development Notes
- Router runs on port 8000 (changed from 8765 due to Replit restrictions)
- React dev server runs on port 5000
- Ollama expected on port 11434
- All network traffic restricted to 127.0.0.1
- Story Bible data stored in Zustand store (in-memory, persistence pending)

## Desktop Application (Tauri)
- **Tauri configuration** located in `apps/desktop/src-tauri/`
- **Custom app icon** with gradient purple-to-blue design (open book + pen)
- **System tray integration** - App minimizes to tray instead of closing
- **Production build** requires local machine (not Replit)
- **Build instructions** in `DESKTOP_BUILD.md` and `QUICK_START_DESKTOP.md`
- **Supported platforms**: Windows (.msi), macOS (.dmg), Linux (.deb, .AppImage)
- **Window behavior**: Close button hides to tray, use tray menu to quit
- **System tray features**:
  - Left-click to show/focus window
  - Right-click menu: Show, Hide, Quit
  - Icon always visible in system tray
- **GitHub Actions workflow** - Automatic builds for all platforms
  - Located in `.github/workflows/build-desktop.yml`
  - Manual trigger via GitHub Actions UI
  - Auto-trigger on version tags (v*)
  - Produces downloadable installers for Windows/Mac/Linux
  - See `GITHUB_ACTIONS_GUIDE.md` for usage instructions

## AI Model System
The app uses a **three-tier model strategy** with **automatic intelligent selection**:

### Small Model (Quick Chat)
- **Default**: `llama3.2:3b`
- **Auto-selected for**: Simple questions, explanations, general chat
- **Keywords**: "what", "how", "why", "explain"
- **Alternatives**: `phi3`, `gemma2:2b`

### Medium Model (Copy Editing & Improvements)
- **Default**: `llama3.2:latest` (7-8B parameters)
- **Auto-selected for**: Fix/improve requests, editing suggestions
- **Keywords**: "fix", "correct", "improve", "suggest", "edit", "change", "revise"
- **Alternatives**: `mistral`, `qwen2.5:7b`

### Large Model (Major Rewrites)
- **Default**: `llama3:70b`
- **Auto-selected for**: Major restructuring, complete rewrites
- **Keywords**: "rewrite", "regenerate", "completely", "major", "comprehensive"
- **Alternatives**: `qwen2.5:72b`, `mixtral:8x7b`

### How It Works
1. **Chat interface**: Analyzes your prompt and automatically selects the best model
2. **Model indication**: Chat responses show which model was used in the Chapter Response window
3. **Configuration**: Change models in the **AI Models** settings page
4. **Offline**: All models run locally through Ollama
5. **Installation**: `ollama pull <model-name>`
