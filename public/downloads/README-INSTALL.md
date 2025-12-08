# EclipAC Anti-Cheat Client

Professional anti-cheat solution for eclip.pro

## Installation

### Option 1: Full Installer (Recommended) ⭐

**Best for most users** - Automatic setup with protocol registration

1. Download `EclipAC-Setup.exe` from [GitHub Releases](https://github.com/4tunexx/eclip/releases)
2. Run the installer (may require administrator privileges)
3. Follow the installation wizard
4. The installer will automatically:
   - Install EclipAC to Program Files
   - Register the `eclip://` protocol handler
   - Create desktop and start menu shortcuts
   - Launch the application

**Download**: `EclipAC-Setup.exe` (168 MB)

### Option 2: Portable Version

**For users who don't want to install** - Manual protocol registration required

1. Download `EclipAC-portable.zip` from [GitHub Releases](https://github.com/4tunexx/eclip/releases)
2. Extract the ZIP file to any location (e.g., `C:\Games\EclipAC\`)
3. Run `EclipAC.exe` directly
4. **IMPORTANT**: Register the protocol handler:
   - Download `register-protocol.bat` to the same folder as `EclipAC.exe`
   - Right-click `register-protocol.bat` → "Run as administrator"
   - This allows eclip.pro to launch the client automatically

**Download**: `EclipAC-portable.zip` (103 MB)

### Option 3: Quick Install Script

**Alternative automated installation**

1. Download `install.bat` from this directory
2. Right-click `install.bat` and select "Run as administrator"
3. The installer will:
   - Install EclipAC to `%USERPROFILE%\AppData\Local\EclipAC`
   - Register the `eclip://` protocol handler
   - Create a desktop shortcut
   - Launch the application

---

## Protocol Registration (Required for Portable)

The `eclip://` protocol allows the website to launch the anticheat client automatically.

**If you see "scheme does not have a registered handler" error:**
1. Open the folder containing `EclipAC.exe`
2. Download `register-protocol.bat` to the same folder
3. Right-click `register-protocol.bat` → "Run as administrator"
4. You should see "SUCCESS! Protocol registered successfully"
5. Restart your browser

**To test if registered:**
- Open your browser and visit: `eclip://test`
- EclipAC should launch automatically

**Troubleshooting:**
- Make sure you ran the batch file as Administrator
- Make sure `EclipAC.exe` is in the same folder as `register-protocol.bat`
- Restart your browser after registration
- If still not working, use the full installer (`EclipAC-Setup.exe`) instead

## Features

✓ **Real-Time Process Monitoring** - Scans running processes every 5 seconds during gameplay
✓ **Cheat Detection** - Identifies common cheat tools:
  - Aimbots (AutoHotkey, etc.)
  - Wallhacks (ReShadow, etc.)
  - Debuggers (OllyDbg, x64dbg, etc.)
  - Reverse Engineering Tools (DNSpy, ILSpy)
  - Suspicious Tools (Frida, Cheat Engine)
  - VPNs and Proxies
  - Virtual Machines

✓ **System Tray Integration** - Minimizes to system tray when closing
✓ **Admin Reporting** - Automatically reports suspicious activity with:
  - Detected process list
  - Player IP address
  - System information
  - Match context

✓ **Live Heartbeat** - Sends heartbeat signals every 30 seconds during active matches

## Usage

### Starting a Match

1. Click "UNSECURED - Click to launch" button on eclip.pro
2. If EclipAC is installed:
   - The `eclip://` protocol handler will launch it automatically
   - Application minimizes to system tray
   - Anti-cheat monitoring begins
3. If not installed:
   - Browser will prompt to download `EclipAC.exe`
   - Follow installation steps

### During Gameplay

- Application runs silently in system tray
- Monitors processes every 5 seconds
- Reports suspicious activity to admins in real-time
- Shows alerts if cheating attempts detected

### System Tray Controls

- Click icon to restore window
- Right-click for menu options
- Close button minimizes to tray (doesn't quit)
- Alt+F4 or Exit menu to fully quit

## System Requirements

- Windows 10 or later (64-bit)
- 150-200 MB disk space
- Administrator privileges for initial setup
- Internet connection for match data and reporting

## Troubleshooting

### EclipAC won't launch from browser
- Run `install.bat` as administrator to register protocol handler
- Verify EclipAC.exe is in `%USERPROFILE%\AppData\Local\EclipAC`

### High CPU Usage
- This is normal during process scanning
- Background monitoring is optimized to minimize impact

### Application crashes
- Ensure Windows 10+ is installed
- Run as administrator
- Try reinstalling using `install.bat`

## Privacy & Security

- All player data is encrypted in transit
- Anti-cheat reports are private and visible only to admins/mods
- No personal data is collected beyond what's necessary for anti-cheat
- Application does not access files outside the game directory

## Support

For issues or questions, contact the eclip.pro support team.

---

**Version**: 2.4.1  
**Last Updated**: December 2025  
**Platform**: Windows 10/11 (64-bit)
