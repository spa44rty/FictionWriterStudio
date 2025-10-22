# 📖 Offline Fiction - Desktop Writing App

A 100% offline desktop writing application for longform fiction with local LLM assistance through Ollama.

---

## 🚀 **Get Ready-Made Installers** (No Building Required!)

### **Automatic Builds with GitHub Actions**

Get Windows/Mac/Linux installers without installing Rust or system dependencies:

1. **Push this project to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```

2. **Trigger the build:**
   - Go to your GitHub repo → **Actions** tab
   - Click **"Build Desktop Apps"**
   - Click **"Run workflow"** → **"Run workflow"**

3. **Download installers** (ready in 10-15 minutes):
   - ✅ Windows: `.msi` installer
   - ✅ macOS: `.dmg` installer  
   - ✅ Linux: `.deb` and `.AppImage`

📖 **Full instructions:** See `GITHUB_ACTIONS_GUIDE.md`

---

## ✨ Features

- 📝 **Chapter Management** - Organize chapters with status tracking (Planned/Draft/Revised/Final)
- 📚 **Story Bible** - Characters, worldbuilding, outline, synopsis, style guide
- 🤖 **AI Writing Assistant** - Chat-based help with automatic model selection
- 🔍 **Prose Analysis** - 16+ quality checks (adverbs, passive voice, clichés, weak verbs, etc.)
- 💾 **100% Offline** - Everything runs locally, no cloud dependencies
- 🎨 **System Tray** - Minimizes to tray instead of closing
- 🖼️ **Custom Icon** - Professional gradient purple-to-blue design

---

## 🧠 AI Models (via Ollama)

The app uses three tiers with intelligent auto-selection:

- **Small** (`llama3.2:3b`) - Quick chat, explanations
- **Medium** (`llama3.2:latest`) - Copy editing, suggestions  
- **Large** (`llama3:70b`) - Major rewrites, restructuring

**Install Ollama & models:**
```bash
# Install from: https://ollama.ai/

ollama pull llama3.2:3b
ollama pull llama3.2:latest
ollama pull llama3:70b
```

---

## 🏗️ Project Structure

```
/apps/desktop/          - Tauri + React frontend (Vite)
/core/router/           - Rust Axum service (prose analysis + Ollama)
/core/schemas/          - JSON schemas for validation
/.github/workflows/     - Automatic build configuration
```

---

## 🛠️ Alternative: Build Locally

**Requirements:** Rust + Node.js + System dependencies

```bash
cd apps/desktop
npm install
npm run tauri:build
```

📖 **Full instructions:** See `DESKTOP_BUILD.md` or `QUICK_START_DESKTOP.md`

---

## 🧪 Development Mode

**Run the web interface only (Replit):**
```bash
cd apps/desktop
npm run dev
```

**Run the full desktop app with hot-reload (local machine):**
```bash
cd apps/desktop
npm install
npm run tauri:dev
```

**Start router service:**
```bash
cd core/router
cargo run
```

---

## 🎯 Using the App

### **Browser Version** (Easiest!)

1. **Install Ollama**: https://ollama.ai/
2. **Configure CORS** (one-time): See `OLLAMA_CORS_SETUP.md`
3. **Pull models**:
   ```bash
   ollama pull llama3.2:3b
   ollama pull llama3.2:latest
   ollama pull llama3:70b
   ```
4. **Start router service**: `cd core/router && cargo run`
5. **Open browser**: Go to `http://localhost:5000`

✅ **Story Bible automatically saves in your browser!**

### **Desktop App** (Optional)

Follow the same steps, but instead of opening a browser, click the installed desktop icon!

**System Tray:**
- **Close button (X)** → Hides to tray (doesn't quit)
- **Left-click tray icon** → Show window
- **Right-click tray icon** → Menu (Show/Hide/Quit)

---

## 📦 Router API (for testing)

**Test prose analysis:**
```bash
curl -s http://127.0.0.1:8000/api/heuristics \
  -H "content-type: application/json" \
  -d '{"text":"It was very cold and suddenly he realized.","rules":{"ban_em_dashes":true,"narrative_contractions":false,"max_sentence_words":28}}' | jq
```

**Test AI editing:**
```bash
curl -s http://127.0.0.1:8000/api/minor_edit \
  -H "content-type: application/json" \
  -d '{"model":"llama3.2:latest","style":{"tense":"past","pov":"close-third","narrative_contractions":false,"dialogue_contractions":true,"ban_em_dashes":true},"text":"He was very cold. It was late.","citations":[]}' | jq
```

---

## 📄 Documentation

- **GITHUB_ACTIONS_GUIDE.md** - Get installers automatically (recommended!)
- **QUICK_START_DESKTOP.md** - Fast local build guide
- **DESKTOP_BUILD.md** - Comprehensive build instructions
- **replit.md** - Full project architecture and features

---

## 📝 License

MIT
