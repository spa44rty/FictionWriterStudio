# ⚡ Quick Start - Desktop Build

## 🎯 You're Ready to Build!

Everything is configured. Just follow these steps on **your local machine**:

---

## 📥 Step 1: Download Project

Download this entire project to your local computer using one of these methods:

**Option A: Download ZIP**
1. Click the three dots (...) in Replit
2. Select "Download as ZIP"
3. Extract the ZIP file on your computer

**Option B: Git Clone**
```bash
git clone <your-replit-url>
cd offline-fiction
```

---

## 🔧 Step 2: Install Prerequisites (One-Time Setup)

### Install Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Install Node.js
Download from: https://nodejs.org/ (get version 18 or higher)

### Install System Dependencies

**Windows:** Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)

**macOS:** Run `xcode-select --install`

**Linux:** 
```bash
sudo apt install libwebkit2gtk-4.0-dev build-essential curl wget file libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

---

## 🚀 Step 3: Build Desktop App

```bash
cd apps/desktop
npm install
npm run tauri:build
```

**That's it!** The installer will be created in `src-tauri/target/release/bundle/`

---

## 📦 What You Get

### Windows
- `Offline Fiction_0.1.0_x64_en-US.msi` - Double-click to install

### macOS
- `Offline Fiction_0.1.0_x64.dmg` - Drag to Applications folder

### Linux
- `offline-fiction_0.1.0_amd64.deb` - Install with `sudo dpkg -i`

---

## 🎨 App Features

✅ **Beautiful Icon** - Custom gradient purple-to-blue design with book & pen  
✅ **System Tray** - Stays running in system tray when you close the window  
✅ **Native Performance** - No browser overhead, pure desktop app  
✅ **Point & Click** - Entire UI is buttons and forms, no command line needed  
✅ **Offline First** - Everything runs locally on your computer  

---

## 💡 Using the App

### First Launch
1. Click the installed app icon
2. The Router service must be running (see below)
3. Ollama must be installed with models

### Required Services

**Start Router Service:**
```bash
cd core/router
cargo run
```

**Install Ollama & Models:**
```bash
# Install Ollama from: https://ollama.ai/

# Pull recommended models
ollama pull llama3.2:3b      # Small (fast chat)
ollama pull llama3.2:latest  # Medium (editing)
ollama pull llama3:70b       # Large (rewrites, optional)
```

### System Tray Behavior
- **Close window (X)** → Hides to tray (app keeps running)
- **Left-click tray icon** → Shows window
- **Right-click tray icon** → Menu (Show/Hide/Quit)
- **To fully quit** → Use tray menu → Quit

---

## 🔥 Development Mode (Optional)

Want to make changes and test them?

```bash
npm run tauri:dev
```

This opens the app with hot-reload - any code changes update instantly!

---

## 📖 Need More Details?

See `DESKTOP_BUILD.md` for comprehensive build instructions and troubleshooting.

---

**You're all set!** The desktop app is fully configured and ready to build. 🎉
