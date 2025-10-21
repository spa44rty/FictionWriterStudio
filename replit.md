# Offline Fiction - Desktop Writing App

## Overview
An offline-first desktop writing application built with Tauri + React + Rust for longform fiction writing with local LLM assistance. The app enforces style guides, maintains canon, and provides deterministic heuristic analysis plus LLM-powered line editing.

## Recent Changes
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
- `POST /api/heuristics` - Deterministic rule checks (adverbs, fillers, em-dashes, weak starters)
- `POST /api/minor_edit` - LLM-powered minor line edits via Ollama

### Heuristic Rules
The deterministic engine detects:
- Adverbs ending in "ly"
- Filler words (really, very, just, quite)
- Weak sentence starters (Then, And, But)
- Em dashes (banned in narration by default)
- Future: contractions, passive voice, body-part subjects

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

## Development Notes
- Router runs on port 8000 (changed from 8765 due to Replit restrictions)
- React dev server runs on port 5000
- Ollama expected on port 11434
- All network traffic restricted to 127.0.0.1
- Story Bible data stored in Zustand store (in-memory, persistence pending)
