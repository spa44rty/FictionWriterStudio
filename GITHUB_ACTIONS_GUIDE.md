# 🤖 Automatic Desktop Builds with GitHub Actions

Your project is configured to automatically build desktop installers for Windows, Mac, and Linux using GitHub Actions!

---

## 🚀 How to Get Your Installers

### **Step 1: Push to GitHub**

1. **Create a new GitHub repository** (if you haven't already)
2. **Push this project to GitHub:**

```bash
# If starting fresh
git init
git add .
git commit -m "Initial commit with Tauri desktop app"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main

# If you already have a repo
git add .
git commit -m "Add desktop build workflow"
git push
```

---

### **Step 2: Trigger the Build**

#### **Option A: Manual Trigger** (Easiest!)

1. Go to your GitHub repository
2. Click the **"Actions"** tab
3. Click **"Build Desktop Apps"** in the left sidebar
4. Click **"Run workflow"** button (top-right)
5. Click the green **"Run workflow"** button
6. Wait 10-15 minutes for builds to complete

#### **Option B: Create a Release Tag**

```bash
git tag v0.1.0
git push origin v0.1.0
```

This automatically triggers the build workflow.

---

### **Step 3: Download Your Installers**

1. Go to **Actions** tab in GitHub
2. Click on the completed workflow run (green checkmark ✓)
3. Scroll down to **"Artifacts"** section
4. Download the installers:
   - **windows-installer** → Contains the `.msi` file
   - **macos-installer** → Contains the `.dmg` file
   - **linux-packages** → Contains `.deb` and `.AppImage` files

---

## 📦 What You'll Get

### **Windows Installer**
- File: `Offline Fiction_0.1.0_x64_en-US.msi`
- Double-click to install
- Creates Start Menu shortcut
- Adds to Programs & Features

### **macOS Installer**
- File: `Offline Fiction_0.1.0_x64.dmg`
- Double-click and drag to Applications
- Works on Intel and Apple Silicon Macs

### **Linux Packages**
- `.deb` file - For Debian/Ubuntu (`sudo dpkg -i filename.deb`)
- `.AppImage` file - Portable, no installation needed

---

## ⚙️ Build Process

The workflow automatically:
1. ✅ Sets up Node.js and Rust
2. ✅ Installs system dependencies
3. ✅ Builds for Windows, macOS, and Linux in parallel
4. ✅ Creates platform-specific installers
5. ✅ Uploads artifacts for download

**Total build time:** 10-15 minutes

---

## 🔄 When to Rebuild

Trigger a new build whenever you:
- Make code changes and push to GitHub
- Want to create a new version
- Add new features to test

Just click **"Run workflow"** again!

---

## 🎯 Distributing to Users

Once you download the installers from GitHub Actions:

1. **Share the files** with your users
2. **Or create a GitHub Release:**
   - Go to Releases → Create new release
   - Upload the installers
   - Add release notes
   - Publish!

Users can then download directly from your GitHub releases page.

---

## 🛠️ Troubleshooting

### Build Fails?
- Check the **Actions** tab for error logs
- Ensure all code is committed and pushed
- Verify `apps/desktop/package.json` has correct dependencies

### Missing Artifacts?
- Make sure the workflow completed successfully (green checkmark)
- Artifacts expire after 90 days by default
- Download them soon after the build completes

### Need Different Platforms?
Edit `.github/workflows/build-desktop.yml` to add/remove platforms from the matrix.

---

## 💡 Pro Tips

1. **Version Tags**: Use semantic versioning (`v0.1.0`, `v0.2.0`, etc.)
2. **Automatic Releases**: Uncomment the release section in the workflow to auto-publish releases
3. **Code Signing**: For production distribution, add code signing certificates (Windows/macOS)
4. **Update Icon**: Change `apps/desktop/src-tauri/icons/icon.png` before building

---

**You're all set!** Push to GitHub and click "Run workflow" to get your installers. 🎉
