# Offline Fiction – Seed Repo

## Quickstart (Router only, easiest on Replit)
1. Ensure Rust (stable) is available.
2. Start the router API: `pnpm router` (or `cargo run -p router` if you prefer).
3. Test heuristics:
   ```bash
   curl -s http://127.0.0.1:8765/api/heuristics -H "content-type: application/json" \
     -d '{"text":"It was very cold and suddenly he realized.","rules":{"ban_em_dashes":true,"narrative_contractions":false,"max_sentence_words":28}}' | jq
   ```
4. Test minor edit (needs Ollama running and a local model, e.g., `llama3.1:8b`):
   ```bash
   curl -s http://127.0.0.1:8765/api/minor_edit -H "content-type: application/json" \
     -d '{"model":"llama3.1:8b","style":{"tense":"past","pov":"close-third","narrative_contractions":false,"dialogue_contractions":true,"ban_em_dashes":true},"text":"He was very cold. It was late.","citations":[]}' | jq
   ```

## Desktop UI (Tauri shell)
- On Replit, Tauri might not run. Locally, install Rust + Node + pnpm, then:
  ```bash
  cd apps/desktop
  pnpm i
  pnpm dev
  ```
  This runs Vite; for a full Tauri app you would run `pnpm tauri dev` after installing Tauri CLI.

## Notes
- Everything is localhost-only. No telemetry. The router calls `http://127.0.0.1:11434` for Ollama.
- Style Guide and Canon schemas live under `core/schemas/`.
