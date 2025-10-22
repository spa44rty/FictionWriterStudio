# Quick Start - Get AI Working in 5 Minutes

This is the **fastest** way to get the AI chat assistant working with this app.

---

## ✅ **Two Simple Options**

### **Option 1: Run Everything Locally (Recommended)**

This is the most reliable way. Everything runs on your Windows computer.

#### **One-Time Setup (20 minutes):**

**1. Download the project:**
```cmd
cd C:\
git clone https://github.com/spa44rty/FictionWriterStudio.git
cd FictionWriterStudio
```
*Don't have Git? Download ZIP from https://github.com/spa44rty/FictionWriterStudio*

**2. Install Ollama:**
- Download: https://ollama.ai/download/windows
- Run installer
- Download models:
```cmd
ollama pull llama3.2:3b
ollama pull llama3.2:latest  
```

**3. Install Node.js:**
- Download: https://nodejs.org/
- Run installer
- Restart computer

**4. Install Rust:**
- Download: https://rustup.rs/
- Run `rustup-init.exe`
- Restart computer

**5. Install dependencies:**
```cmd
cd C:\FictionWriterStudio\apps\desktop
npm install
```

#### **Daily Use (30 seconds):**

**Open 2 Command Prompts:**

**Terminal 1:**
```cmd
cd C:\FictionWriterStudio\core\router
cargo run
```
Wait for: `INFO router: router listening on 127.0.0.1:8000`

**Terminal 2:**
```cmd
cd C:\FictionWriterStudio\apps\desktop
npm run dev
```
Wait for: `Local: http://localhost:5000/`

**Browser:**
- Open: `http://localhost:5000`
- AI chat will work! ✅

---

### **Option 2: Use Replit + Local Ollama (Advanced)**

Run the app on Replit but connect to Ollama on your computer.

**Requirements:**
- Ollama installed on your Windows machine
- Your computer and Replit on same network OR use a tunnel

**Steps:**

**1. On Your Computer:**
```cmd
REM Install and start Ollama
ollama pull llama3.2:3b
ollama serve

REM Get your local IP address
ipconfig
```
Look for "IPv4 Address" (something like `192.168.1.100`)

**2. On Replit:**

Set environment variable in Replit Secrets:
```
OLLAMA_URL=http://YOUR_IP:11434
```
Replace `YOUR_IP` with your computer's IP address.

**3. Restart the Router workflow on Replit**

Now the Replit app will connect to Ollama on your computer! ✅

---

## 🎯 **Which Option Should You Choose?**

| | **Option 1: All Local** | **Option 2: Replit + Local Ollama** |
|---|---|---|
| **Speed** | ⚡ Fast | 🐌 Slower (network latency) |
| **Reliability** | ✅ Very reliable | ⚠️ Network dependent |
| **Setup** | Medium (install 3 things) | Hard (network config) |
| **Best for** | Daily use | Testing only |

**I recommend Option 1** - Run everything on your computer. It's faster and more reliable.

---

## 📝 **Troubleshooting Local Setup**

### **"cargo not found"**
- Rust not installed correctly
- Solution: Install from https://rustup.rs/ and **restart your computer**

### **"npm not found"**  
- Node.js not installed
- Solution: Install from https://nodejs.org/ and **restart your computer**

### **"vite not found"**
- You didn't run `npm install` first
- Solution:
```cmd
cd C:\FictionWriterStudio\apps\desktop
npm install
npm run dev
```

### **"Address already in use"**
- Another instance is running
- Solution: Close all command prompts and try again

### **"Cannot connect to Ollama"**
- Ollama not running
- Solution: Search "Ollama" in Start menu and open it

---

## ✨ **Once It's Working**

You'll have:
- ✅ Full AI chat assistant
- ✅ AI-powered outline generation
- ✅ Smart model selection (small/medium/large)
- ✅ Chapter feedback and suggestions
- ✅ Auto-save to browser storage
- ✅ 100% offline operation

All running on your computer with no cloud dependencies!

---

## 🆘 **Still Having Problems?**

**Check that ALL of these are true:**
1. ✅ Ollama is running (check system tray for icon)
2. ✅ You ran `npm install` in apps/desktop folder
3. ✅ Router shows "listening on 127.0.0.1:8000"
4. ✅ Frontend shows "Local: http://localhost:5000"
5. ✅ You're using `http://localhost:5000` in browser (NOT `127.0.0.1`)

If all 5 are true and it still doesn't work, the issue is something else. Share the specific error message you're seeing.

---

**Bottom line:** Install Node + Rust + Ollama, run 2 terminals, open browser. That's it.
