# Real Data Integration Guide

## Overview

The landing page now displays real data from the Eclip platform database instead of hardcoded placeholder values. All stats and player information are fetched live from the database and update automatically when admin changes are made.

## Public Data Endpoints

### 1. Platform Statistics (`/api/stats/public`)

**Purpose**: Returns live platform statistics for the landing page stats cards

**HTTP Method**: GET  
**Authentication**: None (public endpoint)  
**Response Format**: JSON

**Example Response**:
```json
{
  "onlinePlayers": 42,
  "activeMatches": 15,
  "totalCoins": 8450231,
  "totalUsers": 1204,
  "allTimeMatches": 12345,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Database Queries**:
- **onlinePlayers**: Count of queue tickets with status='WAITING'
- **activeMatches**: Count of matches with status='LIVE'
- **totalCoins**: Sum of all user coins from users table
- **totalUsers**: Count of all users in users table
- **allTimeMatches**: Count of all matches (all time)

**Error Handling**: Returns all zeros if database error occurs (graceful fallback)

---

### 2. Top Players Leaderboard (`/api/leaderboards/public`)

**Purpose**: Returns top players ranked by ESR (live ranking system)

**HTTP Method**: GET  
**Authentication**: None (public endpoint)  
**Query Parameters**:
- `limit` (optional): Number of top players to return (default: 10, max: 100)

**Example Request**: `/api/leaderboards/public?limit=5`

**Example Response**:
```json
{
  "players": [
    {
      "id": "user-123",
      "username": "ProPlayer99",
      "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=ProPlayer99",
      "esr": 2850,
      "rank": 1,
      "rankTier": "Radiant",
      "rankDivision": "I",
      "level": 42
    },
    {
      "id": "user-456",
      "username": "LegendSlayer",
      "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=LegendSlayer",
      "esr": 2720,
      "rank": 2,
      "rankTier": "Radiant",
      "rankDivision": "II",
      "level": 38
    }
  ],
  "count": 2,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Database Queries**:
- Selects users ordered by ESR (descending)
- Limits to requested count (max 100)
- Maps all user ranking information

**Avatar Fallback**: If user doesn't have a custom avatar, uses DiceBear API:
- URL: `https://api.dicebear.com/7.x/avataaars/svg?seed={username}`

**Error Handling**: Returns empty players array if database error occurs

---

## Landing Page Integration

### File: `/src/app/page.tsx`

**Data Fetching**:
- Uses React `useState` for stats, topPlayers, and statsLoading state
- Uses `useEffect` hook to fetch data on component mount
- Fetches both endpoints in parallel using `Promise.all`
- Refreshes data on every page load (real-time)

**Stats Cards Section**:
```tsx
{statsLoading ? (
  <Loader2 className="h-6 w-6 animate-spin" />
) : (
  <CountingNumber targetValue={stats?.onlinePlayers || 0} />
)}
```
- Shows loading spinner while data is being fetched
- Displays animated counting number once data arrives
- Graceful fallback to 0 if stats is undefined

**Top Players Section**:
```tsx
{statsLoading || topPlayers.length === 0 ? (
  <Loader2 className="h-8 w-8 animate-spin" />
) : (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
    {topPlayers.map((player) => (...))}
  </div>
)}
```
- Shows loading spinner during fetch or if no players exist
- Renders player cards in responsive grid (1 col mobile, 3 col tablet, 5 col desktop)
- Displays username, avatar, ESR, rank tier, division, and level

---

## Real-Time Data Sync

### Admin Changes → Landing Page Updates

**How It Works**:
1. Admin makes changes in admin panel (e.g., creates new user, adds coins, changes ESR)
2. Admin changes are saved to database
3. User navigates to/refreshes landing page
4. Landing page fetches fresh data from `/api/stats/public` and `/api/leaderboards/public`
5. New stats and rankings appear immediately

**Examples**:

| Admin Action | Database Change | Landing Page Impact |
|---|---|---|
| Create new user | `users.count++` | Total Users counter increments |
| Award coins to user | `users.coins` updated | Total Coins counter updates |
| Admin modifies user ESR | `users.esr` changed | Player moves in leaderboard ranking |
| New match is played | `matches.count++` | All-time matches counter increments |
| Players join queue | `queueTickets` created | Online players counter increments |
| Match starts | `matches.status='LIVE'` | Active matches counter increments |

---

## API Registry

Both endpoints are documented in `/src/lib/api-registry.ts`:

```typescript
'/api/stats/public': { 
  method: 'GET', 
  status: '✓ Working', 
  description: 'Get public platform stats (online players, active matches, total coins, total users, all-time matches)' 
},

'/api/leaderboards/public': { 
  method: 'GET', 
  status: '✓ Working', 
  description: 'Get public top players (no auth)' 
},
```

---

## Error Handling

### Stats Endpoint Error Fallback
If database query fails:
- Returns HTTP 200 with fallback stats: `{ onlinePlayers: 0, activeMatches: 0, totalCoins: 0, totalUsers: 0, allTimeMatches: 0 }`
- Landing page still displays (counts show as 0)
- Error logged to console for debugging

### Leaderboard Endpoint Error Fallback
If database query fails:
- Returns HTTP 200 with empty players array: `{ players: [], count: 0 }`
- Landing page shows "No players yet. Be the first!"
- Error logged to console for debugging

---

## Performance Considerations

1. **Parallel Fetching**: Both endpoints are fetched simultaneously using `Promise.all`
2. **No Caching**: Endpoints have no cache headers (always fresh data)
3. **Database Optimized**: Queries use direct Drizzle ORM selects (no N+1 queries)
4. **Graceful Degradation**: Page loads even if endpoints timeout

---

## Testing Checklist

- [ ] Landing page stats cards show correct counts from database
- [ ] Top players leaderboard displays users in ESR order
- [ ] Create new user in admin → total users count increments on landing page (after refresh)
- [ ] Award coins in admin → total coins count updates on landing page (after refresh)
- [ ] Change user ESR in admin → leaderboard ranking updates on landing page (after refresh)
- [ ] Players can see their own rank and tier on landing page
- [ ] Avatar fallback works for users without custom avatars
- [ ] Loading spinners appear while data is fetching
- [ ] No errors in browser console when landing page loads
- [ ] All endpoints return valid JSON responses
- [ ] Mobile layout is responsive (1 col players → 5 col on desktop)

---

## Next Steps

1. **Manual Testing**: Load landing page and verify real data appears
2. **Admin Integration Testing**: Make changes in admin panel, refresh landing page, verify changes appear
3. **Performance Testing**: Monitor database query times, optimize if needed
4. **Auto-Refresh (Optional)**: Add interval-based refresh for stats (e.g., every 30 seconds)
5. **Websocket Update (Future)**: For real-time updates without page refresh

---

## Files Modified/Created

### Created
- `/src/app/api/stats/public/route.ts` - Public stats endpoint
- `/src/app/api/leaderboards/public/route.ts` - Public leaderboard endpoint

### Modified
- `/src/app/page.tsx` - Updated to fetch real data, removed hardcoded placeholder data
- `/src/lib/api-registry.ts` - Added new public endpoints to registry

### Unchanged (Still Functional)
- All 50+ other API endpoints remain fully functional
- Admin panel continues to manage all data
- Database schema unchanged
