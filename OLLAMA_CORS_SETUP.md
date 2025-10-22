# 🔧 Ollama CORS Setup Guide

To use Offline Fiction in your browser with local Ollama, you need to configure Ollama to allow browser requests. This is a **one-time setup** that takes about 30 seconds.

---

## 🖥️ **What is CORS?**

CORS (Cross-Origin Resource Sharing) is a browser security feature. By default, Ollama only accepts requests from localhost command-line tools. We need to tell it to also accept requests from your browser.

---

## ⚙️ **Setup Instructions**

### **macOS**

1. **Open Terminal**
2. **Run this command:**
   ```bash
   launchctl setenv OLLAMA_ORIGINS "*"
   ```

3. **Restart Ollama:**
   - Click the Ollama icon in your menu bar
   - Click "Quit Ollama"
   - Open Ollama again from Applications

✅ **Done!** Your browser can now talk to Ollama.

---

### **Windows**

1. **Quit Ollama:**
   - Right-click the Ollama icon in your system tray
   - Click "Quit"

2. **Open Environment Variables:**
   - Press `Windows key` and type "environment variables"
   - Click "Edit the system environment variables"
   - Click "Environment Variables" button

3. **Add New Variable:**
   - Under "User variables", click "New"
   - Variable name: `OLLAMA_ORIGINS`
   - Variable value: `*`
   - Click "OK" on all windows

4. **Restart Ollama:**
   - Open Ollama from Start Menu

✅ **Done!** Your browser can now talk to Ollama.

---

### **Linux**

1. **Edit Ollama service:**
   ```bash
   sudo systemctl edit ollama.service
   ```

2. **Add these lines** (paste between the comments):
   ```ini
   [Service]
   Environment="OLLAMA_ORIGINS=*"
   ```

3. **Save and exit** (Ctrl+X, then Y, then Enter)

4. **Reload and restart:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl restart ollama
   ```

✅ **Done!** Your browser can now talk to Ollama.

---

## ✅ **Test Your Setup**

Open a new terminal and run:

```bash
curl -X OPTIONS http://localhost:11434 \
  -H "Origin: http://localhost:5000" \
  -H "Access-Control-Request-Method: GET" -I
```

**Expected response** (look for this line):
```
Access-Control-Allow-Origin: *
```

If you see that line, it's working! 🎉

---

## 🔒 **Security Note**

### **For Development:**
Using `OLLAMA_ORIGINS=*` is **perfectly fine** for local development. This only affects your local computer - Ollama doesn't accept connections from the internet anyway.

### **For Production (if deploying to a server):**
If you're running Ollama on a server, use specific domains instead:
```bash
OLLAMA_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

---

## 🆘 **Troubleshooting**

### **Still getting CORS errors?**

1. **Make sure Ollama is actually restarted**
   - Fully quit and reopen (not just minimize)
   - Check Task Manager (Windows) or Activity Monitor (Mac) - no Ollama process should be running before you restart

2. **Check the environment variable is set:**
   
   **macOS:**
   ```bash
   launchctl getenv OLLAMA_ORIGINS
   ```
   Should return: `*`

   **Windows:**
   ```cmd
   echo %OLLAMA_ORIGINS%
   ```
   Should return: `*`

   **Linux:**
   ```bash
   sudo systemctl show ollama.service | grep OLLAMA_ORIGINS
   ```
   Should return: `Environment=OLLAMA_ORIGINS=*`

3. **Still stuck?**
   - Make sure Ollama is running: `curl http://localhost:11434`
   - Check your browser console (F12) for the exact error message
   - Try the test command above

---

## 💡 **What This Allows**

After this setup, your browser can:
- ✅ Send AI prompts to your local Ollama models
- ✅ Get AI responses for editing and chat
- ✅ Use all AI features in Offline Fiction

Everything still runs **100% offline** on your computer - no data ever leaves your machine!

---

## 📝 **Summary**

1. Set `OLLAMA_ORIGINS=*` environment variable
2. Restart Ollama completely
3. Test with the curl command
4. Start using Offline Fiction! 🚀

**Need help?** Check the troubleshooting section above or see the Ollama documentation at https://github.com/ollama/ollama/blob/main/docs/faq.md
