# Offline Fiction - Desktop Writing App

## Overview
An offline-first desktop writing application built with Tauri + React + Rust for longform fiction writing with local LLM assistance. The app enforces style guides, maintains canon, and provides deterministic heuristic analysis plus LLM-powered line editing.

## Recent Changes
- 2025-10-22: Transformed Scene Editor into Chapter Editor with individual chapter content storage and save functionality
- 2025-10-22: Added Chapters section above Story Bible for chapter management
- 2025-10-22: Transformed analyzer to "Copy Editor Critique" - professional publishing-house editorial review
- 2025-10-22: Added "Generate Outline" button to Synopsis tab for AI-powered outline creation
- 2025-10-22: Enhanced AI prompting to include specific issues found for targeted line-level fixes
- 2025-10-22: Added concatenated words detection (e.g., "thedark" → suggests "the dark")
- 2025-10-22: Improved analyzer to provide context-aware suggestions for weak verbs, adverbs, and fillers
- 2025-10-22: Added intelligent spelling correction suggestions using Levenshtein distance algorithm
- 2025-10-22: Implemented click-to-apply spelling corrections directly in issue tooltips
- 2025-10-22: Enhanced spelling checker to suggest top 3 most similar words from dictionary
- 2025-10-22: Added click-to-jump navigation from Issues & Suggestions panel to exact locations in scene editor
- 2025-10-22: Implemented inline error highlighting within the scene editor with click-to-edit tooltips
- 2025-10-22: Created InlineEditor component with wavy underlines for issues (red/orange/blue) and suggestions (green)
- 2025-10-22: Added position-based text highlighting with Apply/Ignore options in tooltips
- 2025-10-22: Finalized UI layout: Story Bible (left), Scene Editor (top half), Issues panel (lower half), Chat (bottom)
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
- **Two-section vertical layout:**
  - **Left Sidebar**: Story Bible navigation with resizable drag handle (200-500px)
  - **Center/Right Area (stacked vertically)**:
    - **Full height**: Chapter Editor for writing individual chapter content
    - **Bottom**: AI Writing Assistant chat prompt line

### Chapter Editor Features
- **Individual Chapter Storage**: Each chapter stores its own content separately
  - Click any chapter in the Chapters section to load it in the editor
  - Active chapter highlighted with blue border in chapter list
  - Automatically navigates to editor when chapter is clicked
  - Chapter title shown in editor header (e.g., "Chapter 1: The Beginning")
  
- **Save Chapter Button**: Saves current chapter content and auto-calculates word count
  - Only appears when a chapter is selected
  - Updates chapter with content and recalculates word count
  - Shows success confirmation when saved
  - Content persists when switching between chapters


- **Inline Error Highlighting**: Issues and suggestions appear directly in the text with colored wavy underlines
  - **Issues**: ERROR (red), WARNING (orange), INFO (blue) severity-based colors
  - **AI Suggestions**: Green underlines for LLM-powered improvements
  - Click any highlighted text to see a tooltip with details and actions
  - **Tooltip actions**: Apply (for suggestions), Ignore (for both issues and suggestions)
  - Semi-transparent text overlay when highlights are active for better visibility
  - Position-based highlighting works with real-time text editing
  - All issues and suggestions visible directly in the text with inline tooltips
  
- **Intelligent Spelling Corrections**: Automatic spelling error detection with smart suggestions
  - **Levenshtein distance algorithm** finds up to 3 most similar words from dictionary
  - Click misspelled word to see correction suggestions in tooltip
  - **Click-to-apply**: Each suggestion appears as a green button - click to replace instantly
  - Suggestions appear inline (e.g., "waz" → shows "was", "way", "wax")
  - Only suggests words within edit distance of 2 for accuracy
  - Filters by word length similarity (within 2 characters)
  - Works with the existing Ignore button if suggestions aren't helpful
  
- **Copy Editor Critique**: Professional publishing-house editorial review with comprehensive markup
  - **"Copy Editor Critique" button**: Acts as senior copy editor at prestigious publishing house
  - Runs 16+ deterministic checks to detect issues (spelling, grammar, style, weak verbs, adverbs, fillers, clichés)
  - Provides AI-powered line-by-line improvements as if preparing manuscript for publication
  - **Editorial standards**: Strengthens weak verbs, eliminates adverbs/fillers, fixes spelling, replaces clichés, converts passive to active voice
  - **Preserves author's voice**: Makes prose stronger, clearer, and more engaging while maintaining intent
  - **Dual feedback system**:
    - **Popup window**: Opens after critique completes, showing all issues and suggestions organized by category
    - **Inline highlights**: Issues and suggestions appear directly in the editor with click-to-edit tooltips
  - **Popup window features**:
    - "Issues Found" section with severity badges (ERROR/WARNING/INFO) and color-coded borders
    - "AI Suggestions" section with original vs. suggested text in side-by-side view
    - Apply/Ignore buttons for each suggestion directly in the popup
    - Click "Apply This Change" closes popup and applies the edit
    - Scrollable for long critiques
  - Individual Apply/Ignore options for each suggestion (both popup and inline)
  - Uses medium model for balanced speed and quality
  - All suggestions include rationale: "Copy edit: improved clarity, precision, and readability per publishing standards"
  
- **AI Writing Assistant**: Bottom chat bar spanning full width
  - Ask questions about your writing ("How can I fix the spelling errors?")
  - **Intelligent automatic model selection** based on your prompt:
    - Simple questions/explanations → Small model (fast)
    - Fix/improve/edit requests → Medium model (balanced)
    - Rewrite/regenerate/transform → Large model (highest quality)
  - Context-aware responses based on current text
  - Shows last response preview below prompt line
  - Press Enter or click Ask to submit questions

## Development Notes
- Router runs on port 8000 (changed from 8765 due to Replit restrictions)
- React dev server runs on port 5000
- Ollama expected on port 11434
- All network traffic restricted to 127.0.0.1
- Story Bible data stored in Zustand store (in-memory, persistence pending)

## AI Model System
The app uses a **three-tier model strategy** with **automatic intelligent selection**:

### Small Model (Quick Chat)
- **Default**: `llama3.2:3b`
- **Auto-selected for**: Simple questions, explanations, general chat
- **Keywords**: "what", "how", "why", "explain"
- **Alternatives**: `phi3`, `gemma2:2b`

### Medium Model (Copy Editing & Improvements)
- **Default**: `llama3.2:latest` (7-8B parameters)
- **Auto-selected for**: Fix/improve requests, "Copy Editor Critique" button
- **Keywords**: "fix", "correct", "improve", "suggest", "edit", "change", "revise"
- **Alternatives**: `mistral`, `qwen2.5:7b`

### Large Model (Major Rewrites)
- **Default**: `llama3:70b`
- **Auto-selected for**: Major restructuring, complete rewrites
- **Keywords**: "rewrite", "regenerate", "completely", "major", "comprehensive"
- **Alternatives**: `qwen2.5:72b`, `mixtral:8x7b`

### How It Works
1. **Copy Editor Critique button**: Always uses medium model for balanced quality and professional editorial review
2. **Chat interface**: Analyzes your prompt and automatically selects the best model
3. **Model indication**: Chat responses show which model was used
4. **Configuration**: Change models in the **AI Models** settings page
5. **Offline**: All models run locally through Ollama
6. **Installation**: `ollama pull <model-name>`
