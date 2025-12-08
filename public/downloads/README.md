# EclipAC Downloads Directory

⚠️ **IMPORTANT**: The executable files (`.exe` and `.zip`) are NOT included in git due to GitHub's 100MB file size limit.

## Building the Executables

To generate the anticheat executables for deployment:

### Quick Build
```bash
cd client-app
npm install
npm run build:win
```

This creates the application in `client-app/dist/win-unpacked/`

### Copy to Downloads Folder
After building, copy files here:

```bash
# Windows PowerShell
Copy-Item "client-app\dist\win-unpacked\EclipAC.exe" "public\downloads\EclipAC.exe"
Copy-Item "client-app\dist\win-unpacked\EclipAC.exe" "public\downloads\EclipAC-Setup.exe"

# Create portable ZIP
Compress-Archive -Path "client-app\dist\win-unpacked\*" -DestinationPath "public\downloads\EclipAC-portable.zip" -Force
```

## Required Files for Production

- `EclipAC-Setup.exe` (168.6 MB) - Served by `/api/download/client`
- `EclipAC.exe` (168.6 MB) - Standalone version
- `EclipAC-portable.zip` (103.1 MB) - No-install version

## Documentation (Tracked in Git)

These files ARE in version control:
- `README-INSTALL.md` - User guide
- `BUILD_SUMMARY.md` - Technical details
- `DEPLOYMENT_GUIDE.md` - Integration guide
- `INDEX.md` - Complete reference
- `install.bat` - Auto-installer script

## Alternative Storage Options

Since GitHub has a 100MB limit, consider:

1. **GitHub Releases** - Upload as release assets (recommended)
2. **External CDN** - Upload to S3/CDN
3. **Local Only** - Build on server, keep out of git (current approach)

---

**Status**: Executables excluded from git via `.gitignore`  
**Build**: Required before deployment  
**Size**: ~170MB total
