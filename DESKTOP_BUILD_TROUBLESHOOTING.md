# Desktop Build Troubleshooting

## Common Build Errors & Solutions

### Error: `build-script-build` Exit Code 1 (Icon Generation Failed)

**Symptom:**
```
process didn't exit successfully: build-script-build (exit code: 1)
```
or
```
failed to compile `icons/icon.ico` into a Windows Resource file
```

**Cause:**
Tauri requires multiple icon formats for different platforms:
- `.ico` for Windows
- `.icns` for macOS
- Multiple PNG sizes for Linux and other platforms

If you only have a single `icon.png`, the build will fail on Windows.

**Solution:**

1. **Generate all icon formats** using Tauri CLI:
   ```bash
   cd apps/desktop
   npx @tauri-apps/cli icon src-tauri/icons/icon.png --output src-tauri/icons
   ```

   This creates:
   - `icon.ico` (Windows)
   - `icon.icns` (macOS)
   - `32x32.png`, `128x128.png`, `128x128@2x.png` (Linux)
   - Plus iOS, Android, and Windows Store icons

2. **Verify `tauri.conf.json`** includes all formats:
   ```json
   {
     "tauri": {
       "bundle": {
         "icon": [
           "icons/32x32.png",
           "icons/128x128.png",
           "icons/128x128@2x.png",
           "icons/icon.icns",
           "icons/icon.ico"
         ]
       }
     }
   }
   ```

3. **Add Tauri CLI to `package.json`**:
   ```json
   {
     "devDependencies": {
       "@tauri-apps/cli": "^1.8.0"
     }
   }
   ```

4. **Commit all generated icons** to your repository so GitHub Actions can access them.

---

## GitHub Actions Build Failures

### Missing Dependencies (Linux)

**Error:**
```
Package 'libwebkit2gtk-4.1-dev' has no installation candidate
```

**Solution:**
Install both webkit2gtk versions in workflow:
```yaml
- name: Install dependencies (Ubuntu only)
  if: matrix.platform == 'ubuntu-22.04'
  run: |
    sudo apt-get update
    sudo apt-get install -y libwebkit2gtk-4.0-dev libwebkit2gtk-4.1-dev \
      build-essential curl wget file libssl-dev libgtk-3-dev \
      libayatana-appindicator3-dev librsvg2-dev patchelf libsoup2.4-dev
```

---

## Local Build Issues

### Cargo/Rust Not Found

**Error:**
```
'cargo' is not recognized as an internal or external command
```

**Solution:**
1. Install Rust: https://rustup.rs/
2. Restart your terminal/command prompt
3. Verify: `cargo --version`

### Port Already in Use

**Error:**
```
Address already in use (port 8000 or 5000)
```

**Solution:**
1. Stop other instances of the app
2. Kill processes using the port:
   - Windows: `netstat -ano | findstr :5000` then `taskkill /PID <pid> /F`
   - macOS/Linux: `lsof -ti:5000 | xargs kill`

---

## Icon Requirements

### Source Image Specs
- **Format:** PNG with transparency
- **Size:** 1024x1024 pixels (minimum)
- **Recommended:** Square, centered subject, simple design
- **File:** `apps/desktop/src-tauri/icons/icon.png`

### Regenerating Icons
If you update the source icon:
```bash
cd apps/desktop
npx @tauri-apps/cli icon src-tauri/icons/icon.png --output src-tauri/icons
```

---

## Build Performance

### Slow First Build
First builds take 5-15 minutes because Rust compiles all dependencies. Subsequent builds are faster (1-3 minutes) due to caching.

### GitHub Actions Timeout
If builds timeout (>60 minutes):
1. Check if dependencies are cached
2. Reduce build matrix (build one platform at a time)
3. Use `fail-fast: false` to let other platforms continue

---

## Getting Help

1. **Check logs:**
   - Local: Terminal output
   - GitHub Actions: Click failed job → expand failed step

2. **Common issues:**
   - Missing icons → Regenerate with Tauri CLI
   - Missing dependencies → Check OS-specific requirements
   - Permission errors → Run as admin (Windows) or with sudo (Linux)

3. **Documentation:**
   - Tauri v1 Guide: https://v1.tauri.app/
   - GitHub Actions: See `GITHUB_ACTIONS_GUIDE.md`
   - Desktop Setup: See `DESKTOP_BUILD.md`
