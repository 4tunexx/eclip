# Environment Configuration

## Production (eclip.pro)

All URLs are now set to `https://www.eclip.pro` by default in `.env`:
- Steam Realm: `https://www.eclip.pro`
- Steam Return: `https://www.eclip.pro/api/auth/steam/return`
- API Base: `https://www.eclip.pro`
- WebSocket: `wss://www.eclip.pro`

## Local Development (localhost)

### Option 1: Use .env.local (Recommended)
Create `.env.local` file (copy from `.env.local.example`):
```bash
cp .env.local.example .env.local
```

Then customize for local dev:
```env
STEAM_REALM=http://localhost:9002
STEAM_RETURN_URL=http://localhost:9002/api/auth/steam/return
API_BASE_URL=http://localhost:9002
WS_URL=ws://localhost:9002
```

### Option 2: Auto-Detection
The app automatically detects:
- **Production** (`NODE_ENV=production` or packaged): Uses `www.eclip.pro`
- **Development** (local): Falls back to `localhost:9002`

## Client App (Electron)

The anticheat client (`client-app/main.js`) automatically detects:
- **Packaged/Production**: `https://www.eclip.pro`
- **Development**: `http://localhost:9002`

## Priority Order

1. Environment variable (`.env.local` or `.env`)
2. Auto-detection based on `NODE_ENV` or `app.isPackaged`
3. Fallback to localhost for development

## Testing

### Local Development:
```bash
npm run dev
# Uses localhost:9002
```

### Production Build:
```bash
npm run build
NODE_ENV=production npm start
# Uses www.eclip.pro
```

## Steam Configuration

Make sure to configure Steam with both URLs:
1. Go to: https://steamcommunity.com/dev/apikey
2. Add both domains:
   - `http://localhost:9002` (development)
   - `https://www.eclip.pro` (production)
