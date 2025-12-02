# Anti-Cheat & Enhanced Play System Integration

## Overview

This document describes the integration of the example anti-cheat and play system from the `sample/` folder into the Eclip.pro competitive CS2 platform. The implementation provides a complete Windows-style anti-cheat client interface, enhanced matchmaking UI, and backend integration.

## Architecture

### Components Structure

```
src/
├── components/
│   └── client/
│       ├── ClientContext.tsx        # Global client state management
│       ├── WindowsClient.tsx        # AC client window UI
│       └── WindowsClientWrapper.tsx # Wrapper for layout integration
├── app/
│   ├── (app)/
│   │   ├── layout.tsx              # Updated with ClientProvider
│   │   └── play/
│   │       └── page.tsx            # Enhanced play/matchmaking page
│   └── api/
│       ├── ac/
│       │   ├── heartbeat/
│       │   │   └── route.ts        # AC heartbeat endpoint
│       │   └── ingest/
│       │       └── route.ts        # AC event ingestion (existing)
│       ├── queue/
│       │   ├── join/               # Join matchmaking queue
│       │   ├── leave/              # Leave queue
│       │   └── status/             # Check queue status
│       └── matchmaker/             # Match creation logic
```

## Key Features

### 1. Windows Anti-Cheat Client

**Location:** `src/components/client/WindowsClient.tsx`

A fully interactive Windows-style application that simulates a desktop anti-cheat client:

- **Power Button**: Connect/disconnect from anti-cheat protection
- **Real-time Status**: Shows connection status, ping, CPU usage
- **Event Logs**: Live streaming of anti-cheat events
- **System Status**: Driver status, integrity checks, relay connection

**Features:**
- Draggable window simulation
- Minimize/close buttons
- Dual tabs: System Status & Event Logs
- Smooth animations and transitions
- Persistent connection state (localStorage)

### 2. Client Context Provider

**Location:** `src/components/client/ClientContext.tsx`

Global state management for anti-cheat client:

```typescript
interface ClientContextType {
  isClientConnected: boolean;
  setClientConnected: (status: boolean) => void;
  isClientOpen: boolean;
  setClientOpen: (status: boolean) => void;
  clientVersion: string;
}
```

**Usage:**
```tsx
import { useClient } from '@/components/client/ClientContext';

const { isClientConnected, setClientOpen } = useClient();
```

### 3. Enhanced Play/Matchmaking Page

**Location:** `src/app/(app)/play/page.tsx`

Complete redesign of the play page with:

- **AC Protection Guard**: Prevents queuing without active anti-cheat
- **Modern UI**: Card-based layout with glassmorphism effects
- **Real-time Queue Timer**: Live countdown display
- **Map Pool Preview**: Visual map selection display
- **Game Mode Selection**: Support for multiple game modes (5v5 Ranked, Wingman, 1v1)
- **Region Selection**: Shows ping and region info

### 4. Sidebar Integration

**Location:** `src/components/layout/sidebar.tsx`

Added AC client status indicator at bottom of sidebar:

- **Visual Status**: Green (protected) / Red (unsecured)
- **Click to Launch**: Opens AC client window
- **Animated Indicators**: Pulse effects for active connection
- **Real-time Updates**: Reflects connection state changes

## API Endpoints

### AC Heartbeat

**Endpoint:** `POST /api/ac/heartbeat`

Receives periodic heartbeats from the Windows client to confirm active protection.

**Request:**
```json
{
  "version": "2.4.1",
  "systemInfo": {
    "cpu": "0.4%",
    "ping": 14
  }
}
```

**Response:**
```json
{
  "success": true,
  "serverTime": "2025-12-02T10:30:00.000Z"
}
```

### AC Event Ingest

**Endpoint:** `POST /api/ac/ingest`

Existing endpoint for ingesting anti-cheat violation events.

**Request:**
```json
{
  "userId": "uuid",
  "matchId": "uuid",
  "code": "KNOWN_CHEAT_PROCESS",
  "severity": 8,
  "details": { "process": "cheatengine.exe" }
}
```

### Queue Management

**Join Queue:** `POST /api/queue/join`
- Creates queue ticket
- Validates AC connection (frontend)
- Stores MMR at join time

**Leave Queue:** `POST /api/queue/leave`
- Removes user from queue
- Updates ticket status

**Queue Status:** `GET /api/queue/status`
- Returns current queue state
- Join time, region, MMR

## Database Schema

The system uses existing tables from `src/lib/db/schema.ts`:

### AC Events Table
```typescript
acEvents {
  id: uuid
  userId: uuid
  matchId: uuid (optional)
  code: string
  severity: number (1-10)
  details: jsonb
  reviewed: boolean
  reviewedBy: uuid
  reviewedAt: timestamp
  createdAt: timestamp
}
```

### Queue Tickets Table
```typescript
queueTickets {
  id: uuid
  userId: uuid
  status: 'WAITING' | 'MATCHED' | 'CANCELLED'
  region: string
  mmrAtJoin: number
  matchId: uuid (when matched)
  joinedAt: timestamp
  matchedAt: timestamp
}
```

### Matches Table
```typescript
matches {
  id: uuid
  status: 'PENDING' | 'READY' | 'LIVE' | 'FINISHED' | 'CANCELLED'
  map: string
  scoreTeam1: number
  scoreTeam2: number
  startedAt: timestamp
  endedAt: timestamp
}
```

## User Flow

### Starting a Match

1. User opens Play page
2. If AC client not connected, shows warning screen
3. User clicks "Open Client" → AC window appears
4. User clicks power button → AC connects
5. User returns to Play page → "FIND MATCH" button now active
6. User clicks "FIND MATCH" → Queue ticket created
7. Matchmaker finds 10 players → Match created
8. Users receive match notification

### AC Client Lifecycle

1. **Launch**: User clicks AC status in sidebar or "Open Client" button
2. **Boot**: 2-second initialization animation
3. **Connect**: Driver loads, establishes relay connection
4. **Heartbeat**: Sends periodic pings to `/api/ac/heartbeat`
5. **Monitor**: Scans processes, validates integrity
6. **Event Logging**: Records all AC events with timestamps
7. **Disconnect**: User clicks power button, protection deactivates

## Integration Points

### Layout Wrapper

**File:** `src/app/(app)/layout.tsx`

```tsx
<ClientProvider>
  <SidebarProvider>
    {/* App content */}
  </SidebarProvider>
  <WindowsClientWrapper />
</ClientProvider>
```

### Protected Routes

Any page can check AC status:

```tsx
import { useClient } from '@/components/client/ClientContext';

function ProtectedPage() {
  const { isClientConnected, setClientOpen } = useClient();
  
  if (!isClientConnected) {
    return <ACRequiredWarning onOpen={() => setClientOpen(true)} />;
  }
  
  // ... protected content
}
```

## Styling & Theme

The components use Tailwind CSS with:
- **Dark Theme**: Zinc-950 backgrounds
- **Accent Color**: Green-500 for active/protected states
- **Red Accents**: For warnings and disconnected states
- **Glassmorphism**: Backdrop blur effects
- **Animations**: Pulse, spin, slide-in transitions

## Configuration

### Environment Variables

No new environment variables required. Uses existing:
- Database connection (already configured)
- Redis (optional, for heartbeat storage)

### Feature Flags

All features are enabled by default. To disable:

```typescript
// In ClientContext.tsx
const ENABLE_AC_CLIENT = false;
```

## Testing

### Manual Testing Checklist

- [ ] AC client window opens/closes
- [ ] Power button connects/disconnects
- [ ] Status updates in sidebar
- [ ] Play page shows warning without AC
- [ ] Queue join requires AC connection
- [ ] Event logs update in real-time
- [ ] Status tabs switch correctly
- [ ] Window animations work smoothly
- [ ] State persists across page reloads

### API Testing

```bash
# Test heartbeat endpoint
curl -X POST http://localhost:3000/api/ac/heartbeat \
  -H "Content-Type: application/json" \
  -d '{"version":"2.4.1","systemInfo":{"cpu":"0.4%","ping":14}}'

# Test queue join
curl -X POST http://localhost:3000/api/queue/join \
  -H "Cookie: session=..." 

# Test AC event ingest
curl -X POST http://localhost:3000/api/ac/ingest \
  -H "Authorization: Bearer YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"userId":"...","code":"TEST","severity":5}'
```

## Future Enhancements

### Planned Features

1. **Real Heartbeat Monitoring**
   - Store heartbeats in Redis with TTL
   - Auto-disconnect after missed heartbeats
   - Server-side validation

2. **Advanced AC Detection**
   - Screen capture analysis
   - Memory scanning simulation
   - Process monitoring

3. **Match Replay Integration**
   - AC events timeline in match replays
   - Suspicious activity markers

4. **Admin Dashboard**
   - AC event review panel
   - Bulk ban management
   - Statistics and analytics

5. **Mobile Support**
   - Responsive AC client (tablet view)
   - Mobile-friendly queue interface

### Known Limitations

- AC client is UI-only (no real system scanning)
- Heartbeats not stored server-side yet
- No actual process monitoring
- Queue matching is basic (no advanced MMR balancing)

## Troubleshooting

### AC Client Won't Open

- Check browser console for React errors
- Verify ClientProvider is in layout
- Check z-index conflicts (client uses z-[9999])

### Queue Join Fails

- Verify database connection
- Check user authentication
- Ensure email is verified
- Confirm AC client is connected (frontend check)

### Styling Issues

- Clear Tailwind cache: `npm run build`
- Check for conflicting CSS classes
- Verify all Tailwind utilities are available

## Performance Considerations

- **Client Window**: Rendered only when open (conditional)
- **Event Logs**: Limited to 50 entries (prevents memory leak)
- **Heartbeat**: 8-second intervals (balance between real-time and load)
- **State Persistence**: localStorage for minimal overhead

## Security Notes

- AC client state is client-side only (trust the client for now)
- In production, server must validate AC connection
- Heartbeat endpoint requires authentication
- AC ingest endpoint requires secret token
- All queue operations require valid session

## Migration from Sample

The integration maintains compatibility with the sample code:

| Sample Component | Integrated Location | Changes |
|-----------------|---------------------|---------|
| `App.tsx` | Split into multiple files | Separated concerns |
| `WindowsClient.tsx` | `components/client/` | Added backend hooks |
| `types.ts` | Database schema | Integrated with existing types |
| `constants.ts` | Removed | Using real data from DB |

## Support & Documentation

For questions or issues:
1. Check this documentation
2. Review API endpoint responses
3. Check browser console for errors
4. Verify database schema matches expectations

---

**Last Updated:** December 2, 2025  
**Version:** 1.0.0  
**Authors:** Development Team
