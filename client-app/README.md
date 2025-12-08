# EclipAC Windows Client

This is the Windows anti-cheat client application for Eclip.

## Development

1. Install dependencies:
```bash
cd client-app
npm install
```

2. Run in development:
```bash
npm start
```

3. Build for Windows:
```bash
npm run build:win
```

The built executable will be in `client-app/dist/`

## How It Works

1. The app registers the `eclip://` protocol handler
2. When users click "Launch" on the website, it tries to open `eclip://launch`
3. If the app is installed, Windows will launch it automatically
4. The app connects to your API and sends heartbeats to `/api/ac/heartbeat`

## Production Deployment

1. Build the .exe: `npm run build:win`
2. Host the installer on your server (e.g., `/public/downloads/EclipAC-Setup.exe`)
3. Users download and install it once
4. After installation, clicking "Launch" on the website will open the app automatically

## Protocol Handler

The app registers `eclip://` as a custom protocol. Your website can use:
- `eclip://launch` - Opens the app
- `eclip://connect` - Opens and auto-connects the app
