# Windows Client Setup Guide

This guide explains how to build, test, and deploy the EclipAC Windows client.

## 🚀 Quick Start

### For Development

1. **Test the client in development mode:**
   ```bash
   start-client.bat
   ```
   This will open the Electron app for testing.

### For Production

1. **Build the Windows executable:**
   ```bash
   build-client.bat
   ```
   This will:
   - Install dependencies
   - Build the .exe installer
   - Copy it to `public/downloads/`
   - Make it available at `/api/download/client`

2. **Test the full flow:**
   - Run your Next.js app: `npm run dev`
   - Click "UNSECURED - Click to launch" in the sidebar
   - The launcher dialog will appear
   - Click "Launch Client" (will prompt download since it's not installed)
   - Click "Download Client" 
   - Install the downloaded `EclipAC-Setup.exe`
   - Click "Launch Client" again - it should now open the app!

## 📋 How It Works

### 1. Protocol Handler
When you install `EclipAC-Setup.exe`, it registers the `eclip://` protocol with Windows. This allows websites to launch the app using URLs like `eclip://launch`.

### 2. Launch Flow
```
User clicks "Click to launch"
    ↓
Website tries: eclip://launch
    ↓
┌─────────────────┬──────────────────┐
│ App Installed?  │  App Not Found?  │
│  ✓ App opens    │  ✗ Show download │
└─────────────────┴──────────────────┘
```

### 3. Components

**Web Components:**
- `ClientLauncherDialog.tsx` - Dialog that handles launch/download
- `client-launcher.ts` - Utility functions for protocol handling
- `/api/download/client/route.ts` - Serves the .exe file

**Desktop App:**
- `client-app/main.js` - Electron main process
- `client-app/index.html` - Client UI
- `client-app/package.json` - Build configuration

## 🛠️ Build Configuration

The app is configured in `client-app/package.json`:

```json
{
  "build": {
    "appId": "com.eclip.anticheat",
    "productName": "EclipAC",
    "protocols": [
      {
        "name": "eclip-protocol",
        "schemes": ["eclip"]
      }
    ]
  }
}
```

## 🔧 Customization

### Change the Protocol URL
Edit `src/lib/client-launcher.ts`:
```typescript
const protocolUrl = 'eclip://launch'; // Change 'eclip' to your brand
```

### Update API URL
For production, set the API URL in the client app:
```bash
# In client-app/.env (create this file)
API_URL=https://your-production-domain.com
```

### Custom Branding
1. Replace `client-app/assets/icon.ico` with your icon
2. Update colors in `client-app/index.html`
3. Update app name in `client-app/package.json`

## 📦 Deployment

### Option 1: Self-Hosted
1. Build the client: `build-client.bat`
2. The .exe is now in `public/downloads/`
3. Deploy your Next.js app normally
4. Users download from `/api/download/client`

### Option 2: External CDN
1. Build the client: `cd client-app && npm run build:win`
2. Upload `client-app/dist/*.exe` to your CDN
3. Update download URL in `ClientLauncherDialog.tsx`

### Option 3: GitHub Releases
1. Build the client
2. Create a GitHub release
3. Attach the .exe to the release
4. Update download URL to point to GitHub release

## 🧪 Testing

### Test Protocol Handler
After installing the app:
1. Open Windows Run (Win+R)
2. Type: `eclip://launch`
3. Press Enter
4. App should open!

### Test from Browser
1. Open browser console
2. Run: `window.location.href = 'eclip://launch'`
3. App should open!

### Test Download Flow
1. Don't install the app
2. Click "Launch Client" in your website
3. Should prompt for download
4. Verify download starts

## 🔐 Security Notes

### Code Signing (Recommended for Production)
Windows will show a security warning for unsigned .exe files. To remove this:

1. Get a code signing certificate
2. Add to `client-app/package.json`:
   ```json
   "win": {
     "certificateFile": "path/to/cert.pfx",
     "certificatePassword": "your-password"
   }
   ```

### Auto-Updates (Optional)
To add auto-update functionality:
```bash
cd client-app
npm install electron-updater
```
See Electron documentation for setup.

## 📱 Platform Support

Currently: **Windows Only**

To add macOS/Linux support:
1. Update `client-app/package.json` build targets
2. Add platform detection to `client-launcher.ts`
3. Create separate download endpoints per platform

## 🐛 Troubleshooting

### "App not launching"
- Check if protocol is registered: `reg query HKEY_CLASSES_ROOT\\eclip`
- Reinstall the app
- Try running as administrator

### "Download not starting"
- Check if file exists: `public/downloads/EclipAC-Setup.exe`
- Check API endpoint: Visit `/api/download/client` directly
- Check browser console for errors

### "Build fails"
- Ensure Node.js 18+ is installed
- Delete `client-app/node_modules` and reinstall
- Check for disk space (builds need ~500MB)

## 📚 Additional Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [electron-builder Documentation](https://www.electron.build/)
- [Windows Protocol Handler Guide](https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/aa767914(v=vs.85))

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the Electron logs (Help > Toggle DevTools in the client app)
3. Check browser console for web-side errors
