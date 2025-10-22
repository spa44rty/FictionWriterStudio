# Local Setup Guide - Run in Your Browser at Home

This guide shows you how to download and run the Offline Fiction app on your local Windows computer in a browser.

---

## 📥 **Step 1: Download the Project**

Your project is on GitHub! Clone it to your computer:

### **Option A: Using Git (Recommended)**

**Install Git:**
- Download: https://git-scm.com/download/windows
- Run the installer (accept defaults)

**Clone the project:**
```cmd
cd C:\
git clone https://github.com/spa44rty/FictionWriterStudio.git
cd FictionWriterStudio
```

### **Option B: Download ZIP from GitHub**

1. Go to: **https://github.com/spa44rty/FictionWriterStudio**
2. Click the green **Code** button
3. Click **Download ZIP**
4. Extract to `C:\FictionWriterStudio\`

---

## 🔧 **Step 2: Install Required Software**

### **1. Node.js** (for the web frontend)
- Download: https://nodejs.org/ (choose LTS version)
- Run the installer
- Restart your computer after installation

### **2. Rust** (for the backend router)
- Download: https://rustup.rs/
- Run `rustup-init.exe`
- Follow prompts (accept defaults)
- Restart your command prompt

### **3. Ollama** (for AI features)
- Download: https://ollama.ai/download/windows
- Run the installer
- Ollama will start automatically in the background

### **4. Configure Ollama for Browser Access**

**Set environment variable** (so browser can connect to Ollama):

**PowerShell (Run as Administrator):**
```powershell
[System.Environment]::SetEnvironmentVariable('OLLAMA_ORIGINS', '*', 'User')
```

**Then restart Ollama:**
1. Find Ollama icon in system tray (bottom-right)
2. Right-click → **Quit Ollama**
3. Search for "Ollama" in Start menu and open it

### **5. Download AI Models**

Open Command Prompt:
```cmd
ollama pull llama3.2:3b
ollama pull llama3.2:latest
ollama pull llama3:70b
```

*This will download ~10GB total. Takes 10-30 minutes depending on your internet speed.*

---

## ▶️ **Step 3: Run the App**

### **First Time Setup:**

**1. Install dependencies:**
```cmd
cd C:\FictionWriterStudio\apps\desktop
npm install
```

*This takes 2-5 minutes.*

### **Every Time You Use the App:**

**Open 2 Command Prompt windows:**

**Terminal 1 - Start the Router (Backend):**
```cmd
cd C:\FictionWriterStudio\core\router
cargo run
```

Wait for: `INFO router: router listening on 127.0.0.1:8000`

**Terminal 2 - Start the Web App (Frontend):**
```cmd
cd C:\FictionWriterStudio\apps\desktop
npm run dev
```

Wait for: `Local: http://localhost:5000/`

**Open your browser:**
- Go to: **http://localhost:5000**
- Start writing! ✍️

---

## 💾 **Your Data is Saved Automatically**

Everything you write is automatically saved to your browser's storage:
- ✅ All chapters and content
- ✅ Characters, worldbuilding, style guides
- ✅ Persists when you close the browser
- ✅ ~4GB storage available
- ✅ 100% private (never leaves your computer)

---

## 🛑 **Stopping the App**

When you're done writing:
1. Close the browser tab
2. Press **Ctrl+C** in both terminal windows
3. Type `y` and press Enter when asked

Ollama will keep running in the background (that's OK).

---

## 📝 **Quick Reference**

### **Daily Startup Routine:**
```cmd
REM Terminal 1
cd C:\FictionWriterStudio\core\router
cargo run

REM Terminal 2 (open new window)
cd C:\FictionWriterStudio\apps\desktop
npm run dev

REM Browser
REM Open: http://localhost:5000
```

### **Check if Ollama is Running:**
- Look for Ollama icon in system tray (bottom-right)
- If not there, search "Ollama" in Start menu and open it

### **Troubleshooting:**

**"cargo not found"**
- Rust not installed or terminal not restarted
- Solution: Install Rust from https://rustup.rs/ and restart terminal

**"npm not found"**
- Node.js not installed
- Solution: Install from https://nodejs.org/

**"Cannot connect to Ollama"**
- Ollama not running or CORS not configured
- Solution: Check system tray for Ollama icon, set OLLAMA_ORIGINS=* environment variable

**"Port already in use"**
- Previous instance still running
- Solution: Close other terminals or restart computer

---

## 🎯 **What Works Offline**

✅ **Works without internet:**
- Writing chapters
- Story Bible management
- Character tracking
- Prose analysis (heuristics)
- AI chat/suggestions (using Ollama)

❌ **Requires internet:**
- Downloading AI models (one-time)
- Updating the app (when new features are added)

---

## 📂 **Project Structure**

```
C:\FictionWriterStudio\
├── apps\desktop\          (React web app - runs in browser)
├── core\router\           (Rust backend - analysis + AI)
├── OLLAMA_CORS_SETUP.md   (Detailed Ollama setup)
└── [documentation files]
```

---

## 🆘 **Getting Help**

1. **Check documentation:**
   - `OLLAMA_CORS_SETUP.md` - Ollama configuration
   - `DESKTOP_BUILD.md` - Building desktop installers
   - `GITHUB_ACTIONS_GUIDE.md` - Automated builds

2. **Common issues solved:**
   - See the Troubleshooting section above
   - Most issues are missing software or Ollama not configured

---

## 🚀 **Next Steps**

Once you have this running locally, you can:

1. **Use it daily** - Just run the two terminals and open your browser
2. **Build a desktop app** - Follow `DESKTOP_BUILD.md` for a standalone .exe
3. **Share with others** - They can clone the same GitHub repo

---

**That's it!** You now have a 100% offline writing app running on your computer. All your data stays private and local. 📝
