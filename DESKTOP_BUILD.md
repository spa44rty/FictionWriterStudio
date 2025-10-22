# 🖥️ Building Offline Fiction Desktop App

## 📋 Prerequisites

### Install Required Tools

1. **Rust** (Required)
   ```bash
   # Install Rust toolchain
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Node.js 18+** (Required)
   - Download from https://nodejs.org/
   - Or use nvm: `nvm install 18`

3. **System Dependencies** (OS-specific)

   **Windows:**
   - Install [Microsoft Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
   - Select "Desktop development with C++" workload

   **macOS:**
   ```bash
   xcode-select --install
   ```

   **Linux (Debian/Ubuntu):**
   ```bash
   sudo apt update
   sudo apt install libwebkit2gtk-4.0-dev \
       build-essential \
       curl \
       wget \
       file \
       libssl-dev \
       libgtk-3-dev \
       libayatana-appindicator3-dev \
       librsvg2-dev
   ```

---

## 🚀 Build Instructions

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd offline-fiction

# Install JavaScript dependencies
cd apps/desktop
npm install
```

### 2. Development Mode

```bash
# Run in development mode (hot-reload)
npm run tauri:dev
```

This will:
- Start the Vite dev server
- Launch the Tauri app window
- Enable hot module replacement

### 3. Build Production App

```bash
# Build production executable
npm run tauri:build
```

**Build outputs:**

- **Windows**: `src-tauri/target/release/bundle/msi/Offline Fiction_0.1.0_x64_en-US.msi`
- **macOS**: `src-tauri/target/release/bundle/dmg/Offline Fiction_0.1.0_x64.dmg`
- **Linux**: `src-tauri/target/release/bundle/deb/offline-fiction_0.1.0_amd64.deb`

---

## ✨ Features

### Desktop Integration

✅ **Native Window** - Runs as a standalone desktop application  
✅ **Custom Icon** - Professional app icon with gradient design  
✅ **System Tray** - Minimizes to system tray instead of closing  
✅ **Click to Show** - Left-click tray icon to restore window  
✅ **Right-Click Menu** - Show/Hide/Quit options  
✅ **Window Memory** - Remembers size and position  
✅ **Native Performance** - No browser overhead  

### System Tray Actions

- **Left Click**: Show/focus window
- **Right Click Menu**:
  - Show Window
  - Hide Window
  - Quit

### Window Behavior

- **Close Button (X)**: Hides to tray (doesn't quit)
- **Real Quit**: Use tray menu → Quit
- **Default Size**: 1400x900
- **Minimum Size**: 1000x600
- **Resizable**: Yes
- **Starts Centered**: Yes

---

## 📦 Distribution

### Windows
- `.msi` installer - Professional installation experience
- Installs to Program Files
- Creates Start Menu shortcut
- Adds to Apps & Features

### macOS
- `.dmg` disk image - Drag to Applications
- Code signing recommended for distribution
- `.app` bundle included

### Linux
- `.deb` package - For Debian/Ubuntu
- `.AppImage` - Universal Linux format (portable)
- `.rpm` - For Fedora/RHEL

---

## 🔧 Development Tips

### Hot Reload
- Changes to React code hot-reload automatically
- Rust changes require restart (`npm run tauri:dev` again)

### Debug Console
- Press `F12` in dev mode to open DevTools
- Console logs appear in terminal

### Icon Changes
- Replace `src-tauri/icons/icon.png` with your custom icon
- Icon should be 512x512px minimum
- Transparent PNG recommended

---

## 📝 Configuration

Edit `src-tauri/tauri.conf.json` to customize:
- Window size and position
- App name and version
- System tray behavior
- Bundle settings

---

## 🐛 Troubleshooting

### Build Fails on Windows
- Ensure Visual Studio Build Tools installed
- Restart terminal after Rust installation

### Build Fails on macOS
- Run `xcode-select --install`
- Ensure Command Line Tools installed

### Build Fails on Linux
- Install all webkit dependencies listed above
- Try `sudo apt --fix-broken install`

### App Won't Start
- Check if Router service is running (port 8000)
- Ensure Ollama is installed and running (port 11434)

---

## 🎯 Next Steps After Building

1. **Install Ollama**: https://ollama.ai/
2. **Pull Models**:
   ```bash
   ollama pull llama3.2:3b      # Small model
   ollama pull llama3.2:latest  # Medium model
   ollama pull llama3:70b       # Large model (optional)
   ```
3. **Run Router Service**:
   ```bash
   cd ../../core/router
   cargo run
   ```
4. **Launch Desktop App** - Click the installed icon!

---

## 📄 License

MIT - See LICENSE file for details
