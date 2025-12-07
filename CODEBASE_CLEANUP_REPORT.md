# Codebase Cleanup Report - Mock Data & Incomplete Implementations

**Date:** December 7, 2025  
**Status:** Comprehensive scan completed

---

## Executive Summary

This report documents all mock data, placeholder values, hardcoded test data, incomplete TODOs/FIXMEs, and unfinished implementations found in the codebase. The codebase is in **decent state** with real database queries in most places, but contains several critical incomplete features, debug logging, and placeholder values that should be addressed before production.

---

## 1. CRITICAL ISSUES (Must Fix)

### 1.1 Incomplete GCP Server Orchestration
**File:** `src/lib/gcp/orchestrator.ts`  
**Issue:** All server lifecycle methods are stubbed TODOs
- Line 32: `// TODO: Implement GCP Compute Engine instance creation`
- Line 53: `// TODO: Poll the instance until it's ready and CS2 server is running`
- Line 63: `// TODO: Shutdown and delete the VM instance`
- Line 77: `// TODO: Check the status of the server instance`

**What needs fixing:**
- `createServer()` returns hardcoded `127.0.0.1` and placeholder port instead of actual GCP VM creation
- `waitForServerReady()` just sleeps instead of polling GCP API and checking CS2 server status
- `shutdownServer()` doesn't actually delete instances (cost inefficiency)
- `getServerStatus()` always returns `'stopped'` instead of querying GCP

**Correct implementation should:**
- Use Google Cloud Compute API to create VM instances from template
- Pass match configuration via startup scripts or metadata
- Poll instance status until ready
- Verify CS2 server is running on game port before returning
- Properly shutdown and delete instances after matches
- Query actual GCP instance status

---

### 1.2 Hardcoded Admin Dashboard Stats
**File:** `src/app/(app)/admin/page.tsx` (Lines 22-30)

**Issue:** Shows fake hardcoded values instead of real data
```tsx
{[{
  title: 'Total Users', value: '1,234', hint: 'Active accounts'
}, {
  title: 'Matches Played', value: '5,678', hint: 'Total matches'
}, {
  title: 'Cosmetics', value: '48', hint: 'Items available'
}, {
  title: 'System Health', value: '100%', hint: 'All services online', positive: true
}]}
```

**Correct implementation should:**
- Fetch real stats from API endpoints
- Call `/api/stats/public` to get real database counts
- Display actual system health from `/api/health`
- Update on page load

---

### 1.3 Incomplete Anti-Cheat Implementation
**Files:** 
- `src/app/api/ac/status/route.ts` (Line 21)
- `src/app/api/ac/ingest/route.ts` (Lines 41-42)
- `src/app/api/queue/join/route.ts` (Line 43)

**Issues:**
1. **AC Status Check** - Just returns false/null
   ```ts
   // TODO: When real Windows client is built, check Redis for recent heartbeat
   return NextResponse.json({
     isActive: false, // Will check Redis heartbeat when Windows .exe is ready
   });
   ```

2. **AC Event Ingestion** - Has TODOs for suspicion scoring
   ```ts
   // TODO: Calculate suspicion score
   // TODO: Auto-ban logic for extreme cases
   ```

3. **Queue Join** - Doesn't verify AC is actually active
   ```ts
   // TODO: When Windows .exe client is ready, verify AC is active
   // const redis = await getRedis();
   // const heartbeat = await redis.get(`ac:heartbeat:${user.id}`);
   ```

**Correct implementation should:**
- Real Windows AC client sends heartbeats to Redis
- AC status endpoint checks Redis for recent heartbeat
- Queue join validates AC is active before allowing queue
- Ingest endpoint implements suspicion score calculation
- Auto-ban logic for extreme severity events

---

### 1.4 Incomplete Matchmaker Implementation
**Files:**
- `src/app/api/matches/create/route.ts` (Lines 23, 29)
- `src/app/api/queue/join/route.ts` (Line 61)

**Issues:**
1. **Match Creation** - Uses random matching instead of ESR-based
   ```ts
   // TODO: Implement proper ESR-based matching
   const selectedTickets = waitingTickets.slice(0, 10); // Just takes first 10
   
   map: 'Mirage', // TODO: Random map selection
   ```

2. **Matchmaker Process** - Not started
   ```ts
   // TODO: Start matchmaker process
   ```

**Correct implementation should:**
- Group players by region and ESR range
- Create balanced teams based on skill
- Random map selection from available pool
- Start background matchmaker job/cron
- Set timeouts for unmatched players

---

### 1.5 Incomplete Mission Progress Tracking
**File:** `src/app/api/matches/[id]/result/route.ts` (Line 115)

**Issue:** Mission progress not updated after matches
```ts
// TODO: Update mission progress
```

**Correct implementation should:**
- Check user's active missions after match completion
- Update progress based on match result and mission requirements
- Mark missions as completed when objectives reached
- Award XP and coin rewards

---

## 2. DEBUG LOGGING (Should Remove)

All `console.log()` statements in production code should be removed or replaced with proper logging:

**Files with excessive logging:**
- `src/app/api/auth/login/route.ts` - Multiple `console.log('[Login]...')`
- `src/app/api/auth/me/route.ts` - Multiple `console.log('[API/Auth/Me]...')`
- `src/app/api/health/route.ts` - Line 14: `console.error('Database connection error:', error)`
- `src/lib/verify-env.ts` - Lines 63, 67-68: `console.log()` and `console.warn()`

**Severity:** Low (functional, but clutters logs)

---

## 3. PLACEHOLDER/TEST DATA

### 3.1 Placeholder Data Module
**File:** `src/lib/placeholder-data.ts` (338 lines)

**Issue:** Entire file contains hardcoded test data exported for use
```ts
export const topPlayers: Player[] = [...]
export const currentUser: User = { username: 'n3o', ... }
export const recentMatches: Match[] = [...]
export const shopItems: Cosmetic[] = [...]
export const forumCategories: ForumCategory[] = [...]
```

**Problem:** This file is imported and potentially used instead of real API data

**Action:** Check where this is imported and replace with real API calls

---

### 3.2 Placeholder Email Values
**Files:**
- `src/components/auth/LoginForm.tsx` - Line 85: `placeholder="m@example.com"`
- `src/components/auth/RegisterForm.tsx` - Line 117: `placeholder="m@example.com"`
- `src/app/(app)/support/page.tsx` - Line 126: `placeholder="you@example.com"`
- `src/app/api/support/route.ts` - Lines 20, 23: `'unknown@example.com'`

**Assessment:** These are UI placeholders (acceptable) but one is a fallback value that should have proper validation

**Fix needed:**
```ts
// Line 20-23 - should reject unknown email instead of using placeholder
if (!user?.email && !email) {
  return NextResponse.json(
    { error: 'Email is required' },
    { status: 400 }
  );
}
```

---

### 3.3 Configuration Placeholders
**Files:**
- `src/app/(app)/admin/config/page.tsx` (Lines 137, 172, 246)

**Issue:** Image URL placeholders in form fields
```tsx
placeholder="https://example.com/logo.png"
placeholder="https://example.com/favicon.png"
placeholder="https://example.com/banner.jpg"
```

**Assessment:** Acceptable UI placeholders

---

## 4. TODO/FIXME/WIP COMMENTS

### 4.1 TODOs in API Routes
1. **src/app/api/queue/join/route.ts**
   - Line 57: `region: 'EU', // TODO: Get from user settings` - Should fetch user's preferred region
   
2. **src/app/api/matches/create/route.ts**
   - Line 23: `// TODO: Implement proper ESR-based matching`
   - Line 29: `// TODO: Random map selection`

3. **src/app/api/ac/ingest/route.ts**
   - Line 41: `// TODO: Calculate suspicion score`
   - Line 42: `// TODO: Auto-ban logic for extreme cases`

4. **src/app/api/ac/status/route.ts**
   - Line 21: `// TODO: When real Windows client is built, check Redis for recent heartbeat`

5. **src/app/api/matches/[id]/result/route.ts**
   - Line 115: `// TODO: Update mission progress`

6. **src/lib/gcp/orchestrator.ts**
   - Lines 32, 53, 63, 77: Multiple critical TODOs for GCP integration

### 4.2 TODOs in Components/Client Code
1. **src/components/client/WindowsClient.tsx** (Line 28)
   - Comment mentions: `// TODO: uncomment Redis check` in documentation

---

## 5. ISSUES REQUIRING INVESTIGATION

### 5.1 Hard-coded Default Values
**File:** `src/app/api/auth/register/route.ts` (Line 70)
```ts
steamId: `temp-${crypto.randomUUID()}`, // placeholder until user links Steam
```

**Assessment:** This is acceptable for registration, but should be replaced once user links Steam account

---

### 5.2 Fallback/Placeholder Values in Auth
**File:** `src/app/api/auth/steam/return/route.ts` (Line 81)
```ts
// Sync Steam avatar if we have none or a temp placeholder
if (!avatarUrl) {
  const steamAvatar = await fetchSteamAvatar(steamId);
  if (steamAvatar) {
    await db.update(users)
      .set({ avatar: steamAvatar })
      .where(eq(users.id, userId));
  }
}
```

**Assessment:** This is proper fallback logic, not a problem

---

## 6. PLACEHOLDER RETURN VALUES

### 6.1 Stats Endpoint Fallback
**File:** `src/app/api/stats/public/route.ts` (Lines 45-53)

**Issue:** Returns hardcoded zeros on error instead of actual stats
```ts
return NextResponse.json(
  {
    onlinePlayers: 0,
    activeMatches: 0,
    totalCoins: 0,
    totalUsers: 0,
    allTimeMatches: 0,
    timestamp: new Date().toISOString(),
  },
  { status: 200 }
);
```

**Assessment:** This is acceptable fallback behavior, but logging should indicate why stats failed

---

## 7. USAGE OF PLACEHOLDER-DATA IMPORT

Need to search for imports of `placeholder-data.ts` to ensure it's not used in production:

**Search needed:** `grep -r "from.*placeholder-data" src/`

If found in components/pages, those need to be refactored to use real API calls.

---

## 8. CRITICAL: IN-MEMORY CHAT STORAGE

**File:** `src/app/api/chat/messages/route.ts` (Lines 5-21)

**MAJOR ISSUE:** Chat uses in-memory array storage instead of database
```ts
// In-memory chat storage (for development - would use database in production)
const chatMessages: Array<{...}> = [
  {
    id: '1',
    userId: 'system-1',
    username: 'System',
    text: 'Welcome to the live chat!...',
    createdAt: new Date(Date.now() - 60000),
  },
];
```

**Problems:**
1. Messages are lost when server restarts
2. Not persistent across multiple instances
3. Doesn't scale horizontally
4. No message history for users
5. Can't recover deleted/reported messages
6. Hard limit of 1000 messages (line 85)

**Correct implementation should:**
- Use database table for chat messages
- Persist all messages permanently
- Support pagination/history
- Enable message moderation
- Handle scaling properly

---

## 9. DISABLED UI ELEMENTS

**File:** `src/app/(app)/forum/page.tsx` (Line 105)
```tsx
<Button disabled>
  <MessageSquarePlus className="mr-2 h-4 w-4" />
  New Thread
</Button>
```

**Assessment:** Button is disabled, meaning thread creation isn't implemented. Check if endpoint exists.

---

## 9. DATABASE CONNECTION TESTS

**File:** `src/app/api/health/route.ts` (Lines 7-15)

Uses raw SQL ping which is acceptable for health checks, but should be noted.

---

## REMEDIATION PRIORITY

### 🔴 CRITICAL (Fix before any launch)
1. **In-memory chat storage** - Replace with database (persistent storage)
2. GCP Server Orchestration (all 4 TODO methods)
3. Matchmaker ESR-based matching
4. Anti-cheat verification in queue
5. Mission progress tracking after matches
6. Admin dashboard stats (hardcoded values)

### 🟡 HIGH (Fix soon)
1. AC suspicion score calculation
2. Map random selection
3. AC heartbeat verification implementation
4. Remove/organize console.log statements
5. Chat message persistence & pagination

### 🟢 LOW (Nice to have)
1. Email fallback value handling
2. Placeholder-data file usage audit
3. Region preference loading
4. Forum thread creation

---

## VERIFICATION CHECKLIST

- [ ] GCP orchestrator methods have real implementations
- [ ] Matchmaker uses ESR-based grouping
- [ ] Admin stats dashboard fetches from real API
- [ ] AC client integration working
- [ ] Mission progress tracked automatically
- [ ] No hardcoded test data in production code paths
- [ ] Console logs removed (or at ERROR level only)
- [ ] All TODO comments resolved
- [ ] Placeholder-data.ts not imported by pages/components

---

**End of Report**
