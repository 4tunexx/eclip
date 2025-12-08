# 🏗️ Windows Client Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Your Website (Next.js)                       │  │
│  │                                                           │  │
│  │  ┌────────────────────┐      ┌────────────────────────┐  │  │
│  │  │  Sidebar Button    │ ───▶ │ ClientLauncherDialog   │  │  │
│  │  │  "Click to launch" │      │                        │  │  │
│  │  └────────────────────┘      └───────────┬────────────┘  │  │
│  │                                          │               │  │
│  │                                          ▼               │  │
│  │                              ┌─────────────────────┐     │  │
│  │                              │ client-launcher.ts  │     │  │
│  │                              │ • Protocol check    │     │  │
│  │                              │ • Download fallback │     │  │
│  │                              └──────────┬──────────┘     │  │
│  └───────────────────────────────────┬─────┴────────────────┘  │
└────────────────────────────────────┬─┼───────────────────────┘
                                     │ │
                    ┌────────────────┘ └──────────────────┐
                    │                                      │
                    ▼ eclip://launch                       ▼ /api/download/client
                    │                                      │
    ┌───────────────┴──────────────┐      ┌──────────────┴────────────────┐
    │     Windows Protocol         │      │    Download .exe Installer    │
    │     Handler Registry         │      │    (One-time download)        │
    └───────────────┬──────────────┘      └──────────────┬────────────────┘
                    │                                      │
                    ▼ Opens App                            ▼ User Installs
    ┌───────────────────────────────────────────────────────────────────┐
    │                    WINDOWS DESKTOP APP                            │
    │                     (Electron - Native)                           │
    │                                                                   │
    │  ┌─────────────────────────────────────────────────────────────┐ │
    │  │  main.js (Main Process)                                     │ │
    │  │  • Protocol handler                                         │ │
    │  │  • Window management                                        │ │
    │  │  • IPC communication                                        │ │
    │  │  • Heartbeat sender ─────────────────────────┐             │ │
    │  └──────────────────────────────────────────────┼─────────────┘ │
    │                                                  │               │
    │  ┌──────────────────────────────────────────────┼─────────────┐ │
    │  │  index.html (Renderer Process)               │             │ │
    │  │  • UI rendering                              │             │ │
    │  │  • User interactions                         │             │ │
    │  │  • Log display                               │             │ │
    │  │  • Status indicators                         │             │ │
    │  └──────────────────────────────────────────────┘             │ │
    └────────────────────────────────────────────────────────────────┘
                                                  │
                                                  │ POST /api/ac/heartbeat
                                                  │ every 30 seconds
                                                  │
                                                  ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                         YOUR SERVER                              │
    │                      (Next.js API Routes)                        │
    │                                                                  │
    │  ┌────────────────────┐  ┌────────────────────┐                │
    │  │ /api/ac/heartbeat  │  │ /api/ac/status    │                │
    │  │ Receives heartbeats│  │ Checks if AC active│               │
    │  └─────────┬──────────┘  └────────────────────┘                │
    │            │                                                     │
    │            ▼                                                     │
    │  ┌────────────────────┐                                        │
    │  │  Redis / Database  │                                        │
    │  │  Stores AC status  │                                        │
    │  └────────────────────┘                                        │
    └─────────────────────────────────────────────────────────────────┘
```

## Component Interaction Flow

### 1️⃣ First Time User (App Not Installed)

```
User clicks "Click to launch"
            ↓
Launcher Dialog opens
            ↓
User clicks "Launch Client"
            ↓
Try: eclip://launch protocol
            ↓
⏱️  Wait 2 seconds...
            ↓
❌ No response (app not installed)
            ↓
Automatically trigger download
            ↓
Browser downloads EclipAC-Setup.exe
            ↓
User installs the app
            ↓
Windows registers eclip:// protocol
            ↓
✅ Ready for next time!
```

### 2️⃣ Returning User (App Installed)

```
User clicks "Click to launch"
            ↓
Launcher Dialog opens
            ↓
User clicks "Launch Client"
            ↓
Try: eclip://launch protocol
            ↓
✅ Windows finds handler
            ↓
App launches instantly
            ↓
User sees EclipAC window
            ↓
User clicks "Connect"
            ↓
Heartbeats start sending to server
            ↓
Server tracks AC status in Redis
            ↓
🎮 User can now play!
```

## File Structure

```
eclip.pro/
│
├── client-app/                          # Windows Desktop App
│   ├── package.json                     # Electron config + protocol handler
│   ├── main.js                          # Main process (protocol, IPC, heartbeat)
│   ├── index.html                       # UI (renderer process)
│   ├── assets/
│   │   └── icon.ico                     # App icon (add your own)
│   └── dist/                            # Built .exe files (after build)
│       └── EclipAC-Setup.exe
│
├── src/
│   ├── lib/
│   │   └── client-launcher.ts           # Protocol handling utilities
│   │
│   ├── components/client/
│   │   ├── ClientContext.tsx            # State management
│   │   ├── ClientLauncherDialog.tsx     # Launch/download dialog
│   │   ├── ClientLauncherWrapper.tsx    # Context wrapper
│   │   ├── WindowsClient.tsx            # Original demo client
│   │   └── WindowsClientWrapper.tsx     # Demo wrapper
│   │
│   └── app/api/download/client/
│       └── route.ts                     # .exe download endpoint
│
├── public/downloads/
│   └── EclipAC-Setup.exe               # Served to users
│
├── build-client.bat                     # Build script
├── start-client.bat                     # Dev test script
│
└── Documentation
    ├── CLIENT_SETUP_GUIDE.md           # Detailed guide
    ├── WINDOWS_CLIENT_COMPLETE.md      # Summary & checklist
    └── ARCHITECTURE.md                 # This file
```

## Data Flow: Heartbeat System

```
┌─────────────────────┐
│  Desktop App        │
│  (Every 30 seconds) │
└──────────┬──────────┘
           │
           │ POST /api/ac/heartbeat
           │ {
           │   version: "2.4.1",
           │   systemInfo: {
           │     ping: "14ms",
           │     cpu: "0.4%"
           │   }
           │ }
           ↓
┌─────────────────────┐
│  API Route          │
│  /api/ac/heartbeat  │
└──────────┬──────────┘
           │
           │ Extract user from token/session
           │ Update last heartbeat timestamp
           ↓
┌─────────────────────┐
│  Redis              │
│  SET ac:user:123    │
│  TTL: 60 seconds    │
└─────────────────────┘
           │
           │ Key expires if heartbeat stops
           ↓
┌─────────────────────┐
│  Matchmaking        │
│  Checks AC status   │
│  before queue join  │
└─────────────────────┘
```

## Protocol Handler Registration

When user installs `EclipAC-Setup.exe`, Windows creates:

```
Registry Entry:
HKEY_CLASSES_ROOT\eclip
    (Default) = "URL:eclip Protocol"
    URL Protocol = ""
    
    shell\open\command
        (Default) = "C:\Program Files\EclipAC\EclipAC.exe" "%1"
```

Now any link like `eclip://launch` will open the app!

## Security Considerations

### Client Side
- ✅ Protocol handler prevents arbitrary code execution
- ✅ Single instance lock prevents multiple app launches
- ✅ IPC communication is local only
- ⚠️ Code signing recommended for production

### Server Side
- ✅ Heartbeat endpoint validates user session
- ✅ Redis TTL auto-expires stale connections
- ✅ Rate limiting prevents abuse
- ⚠️ Token-based authentication required

## Scalability

### Current Setup (Good for small-medium apps)
- Desktop app → API → Redis
- Direct heartbeat every 30 seconds
- Works for 1-10K concurrent users

### For Large Scale (10K+ users)
Consider:
1. WebSocket instead of polling
2. Load balancer for API
3. Redis cluster for AC status
4. CDN for .exe distribution
5. Auto-update server

## Development Workflow

```bash
# Terminal 1: Run Next.js dev server
npm run dev

# Terminal 2: Run desktop app
npm run client:dev

# OR just test in browser without app
# (uses demo WindowsClient component)
```

## Production Deployment

```bash
# 1. Build desktop app
npm run client:build

# 2. .exe is now in public/downloads/

# 3. Deploy Next.js normally
npm run build
npm start

# Users download from: /api/download/client
```

## Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Desktop App | Electron | Cross-platform desktop framework |
| Protocol Handler | Windows Registry | Launch app from browser |
| UI Framework | HTML/CSS/JS | App interface |
| Build Tool | electron-builder | Package as .exe installer |
| Web Framework | Next.js | Website backend |
| State Management | React Context | Client state |
| API | Next.js API Routes | Heartbeat endpoints |
| Storage | Redis | Track active AC clients |

## Browser Compatibility

| Browser | Protocol Support | Download Support |
|---------|-----------------|------------------|
| Chrome | ✅ Yes | ✅ Yes |
| Edge | ✅ Yes | ✅ Yes |
| Firefox | ✅ Yes | ✅ Yes |
| Safari | ⚠️ Requires user confirmation | ✅ Yes |
| Opera | ✅ Yes | ✅ Yes |

## Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
| Windows 10/11 | ✅ Full Support | Primary target |
| macOS | 🔧 Possible | Need to add build target |
| Linux | 🔧 Possible | Need to add build target |

To add macOS/Linux, update `client-app/package.json`:
```json
"build": {
  "mac": { "target": "dmg" },
  "linux": { "target": "AppImage" }
}
```

## Monitoring & Analytics

Consider tracking:
- Download counts
- Install rates
- Active connections
- Heartbeat failures
- Version distribution

Add to your analytics:
```typescript
// When download starts
analytics.track('client_download_started');

// When protocol succeeds
analytics.track('client_launched');

// When heartbeat fails
analytics.track('client_heartbeat_failed');
```

---

**Questions? Check CLIENT_SETUP_GUIDE.md or WINDOWS_CLIENT_COMPLETE.md**
