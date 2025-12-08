# EclipAC Anti-Cheat Client

Professional anti-cheat solution for eclip.pro

## Installation

### Option 1: Automated Installation (Recommended)

1. Download `install.bat` from this directory
2. Right-click `install.bat` and select "Run as administrator"
3. The installer will:
   - Install EclipAC to `%USERPROFILE%\AppData\Local\EclipAC`
   - Register the `eclip://` protocol handler
   - Create a desktop shortcut
   - Launch the application

### Option 2: Manual Installation

1. Download `EclipAC.exe` 
2. Create a folder: `C:\Users\<YourUsername>\AppData\Local\EclipAC`
3. Copy `EclipAC.exe` to that folder
4. Run `EclipAC.exe`
5. Register protocol handler manually (see below)

### Option 3: Portable Version

1. Download `EclipAC-portable.zip`
2. Extract to any location
3. Run `EclipAC.exe` directly
4. Does not require installation

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
