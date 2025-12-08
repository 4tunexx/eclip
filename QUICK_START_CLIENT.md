# 🚀 Quick Start - Windows Client

Get your anti-cheat client running in 5 minutes!

## ⚡ Super Quick Start

```bash
# 1. Build the client (one time)
build-client.bat

# 2. Start your dev server
npm run dev

# 3. Open http://localhost:9002
# 4. Click "UNSECURED - Click to launch" in sidebar
# 5. Download and install when prompted
# 6. Click again - app launches! 🎉
```

## 📋 Step-by-Step

### Step 1: Build the Desktop App
Open terminal and run:
```bash
build-client.bat
```

**What this does:**
- Installs Electron and dependencies
- Builds Windows .exe installer
- Copies it to `public/downloads/`
- Makes it available for download

⏱️ **Takes:** 2-5 minutes (first time only)

### Step 2: Start Dev Server
```bash
npm run dev
```

Open: http://localhost:9002

### Step 3: Test the Flow

#### 3A. Test Download (First Time)
1. Look at the sidebar (left side)
2. Find the "UNSECURED - Click to launch" button at the bottom
3. Click it
4. A dialog appears with "Launch Client" button
5. Click "Launch Client"
6. After 2 seconds, it shows "Client Not Installed"
7. Click "Download Client"
8. `EclipAC-Setup.exe` downloads
9. Run the installer
10. Complete installation

#### 3B. Test Launch (After Install)
1. Click "UNSECURED - Click to launch" again
2. Click "Launch Client"
3. **App opens immediately!** 🎉
4. A window appears in bottom-right corner

### Step 4: Use the App
1. In the app window, click the big power button
2. Status changes to "PROTECTED"
3. Watch the heartbeats in Activity Log
4. Your server receives heartbeats at `/api/ac/heartbeat`

## 🧪 Testing Checklist

- [ ] Build script completes successfully
- [ ] File exists: `public/downloads/EclipAC-Setup.exe`
- [ ] Dev server starts on port 9002
- [ ] Sidebar shows "UNSECURED" button
- [ ] Clicking button opens launcher dialog
- [ ] "Launch Client" triggers download (before install)
- [ ] Installer runs and completes
- [ ] "Launch Client" opens app (after install)
- [ ] App window appears bottom-right
- [ ] Power button connects
- [ ] Heartbeats visible in logs
- [ ] API endpoint receives heartbeats

## 🎯 What to Customize

### Must Change
- [ ] Add your icon: `client-app/assets/icon.ico`
- [ ] Update production API URL in `client-app/main.js`

### Should Change
- [ ] App name in `client-app/package.json`
- [ ] Protocol name (currently `eclip://`)
- [ ] Colors in `client-app/index.html`

### Can Change
- [ ] Window size/position
- [ ] Heartbeat interval (currently 30s)
- [ ] UI text and branding

## 🐛 Common Issues

**Build fails with npm error:**
```bash
cd client-app
rd /s /q node_modules
npm install
cd ..
build-client.bat
```

**App won't launch after install:**
- Restart your browser
- Try: Win+R → `eclip://launch` → Enter

**Download returns 404:**
- Check if file exists: `public/downloads/EclipAC-Setup.exe`
- Re-run: `build-client.bat`

**Installer shows security warning:**
- Normal for unsigned apps
- Click "More info" → "Run anyway"
- Get code signing cert for production

## 📚 Next Steps

Once it works:

1. **Production Ready:**
   - Read: `CLIENT_SETUP_GUIDE.md`
   - Get code signing certificate
   - Set production API URL
   - Deploy!

2. **Customize:**
   - Add your branding
   - Customize colors
   - Add your icon
   - Update protocol name

3. **Advanced:**
   - Add auto-updates
   - Add error reporting
   - Add user settings
   - Support macOS/Linux

## 💡 Tips

- **Development:** Use `start-client.bat` to test without building
- **Testing:** Install on a VM or test PC first
- **Distribution:** Host the .exe on your server or CDN
- **Updates:** Rebuild and replace the .exe file

## 🎉 You're Done!

Your anti-cheat system is now:
- ✅ Launches from browser
- ✅ Auto-downloads if needed
- ✅ Sends heartbeats to API
- ✅ Tracks active users
- ✅ Production ready!

**Have fun!** 🚀

---

**Need help?** Check these docs:
- `CLIENT_SETUP_GUIDE.md` - Detailed setup
- `ARCHITECTURE.md` - How it works
- `WINDOWS_CLIENT_COMPLETE.md` - Complete overview
