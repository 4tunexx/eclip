# Quick Reference - Issues by Severity

## 🔴 CRITICAL (6 Issues - FIX IMMEDIATELY)

### 1. In-Memory Chat Storage
- **File:** `src/app/api/chat/messages/route.ts` (lines 5-21, 85)
- **What:** Chat uses RAM instead of database
- **Fix:** Migrate to database with persistence
- **Estimated effort:** 4-6 hours

### 2. GCP Server Orchestration (4 methods)
- **File:** `src/lib/gcp/orchestrator.ts` (lines 32, 53, 63, 77)
- **What:** All match server creation/management is stubbed
- **Fix:** Implement real GCP Compute Engine API calls
- **Estimated effort:** 8-12 hours

### 3. Hardcoded Admin Dashboard Stats
- **File:** `src/app/(app)/admin/page.tsx` (lines 22-30)
- **What:** Shows fake numbers instead of real data
- **Fix:** Fetch from API endpoints
- **Estimated effort:** 1-2 hours

### 4. No ESR-Based Matchmaking
- **File:** `src/app/api/matches/create/route.ts` (lines 23-24)
- **What:** Matches first 10 players regardless of skill
- **Fix:** Implement ESR-based team balancing
- **Estimated effort:** 4-6 hours

### 5. Queue Missing AC Verification
- **File:** `src/app/api/queue/join/route.ts` (line 43)
- **What:** Doesn't verify anti-cheat is running
- **Fix:** Check Redis for AC heartbeat
- **Estimated effort:** 2-3 hours

### 6. No Hardcoded Map Selection
- **File:** `src/app/api/matches/create/route.ts` (line 29)
- **What:** Always selects "Mirage" map
- **Fix:** Implement random map rotation
- **Estimated effort:** 30 minutes

---

## 🟡 HIGH (6 Issues - FIX SOON)

### 1. AC Status Always Returns False
- **File:** `src/app/api/ac/status/route.ts` (lines 1-30)
- **What:** Hardcoded false instead of checking Redis
- **Fix:** Query Redis for actual AC status
- **Estimated effort:** 1 hour

### 2. Missing AC Suspicion Score
- **File:** `src/app/api/ac/ingest/route.ts` (line 41)
- **What:** Doesn't calculate event severity/scoring
- **Fix:** Implement suspicion scoring algorithm
- **Estimated effort:** 3-4 hours

### 3. Missing AC Auto-Ban Logic
- **File:** `src/app/api/ac/ingest/route.ts` (line 42)
- **What:** No automatic bans for extreme cases
- **Fix:** Add threshold-based auto-ban
- **Estimated effort:** 2-3 hours

### 4. Mission Progress Not Tracked
- **File:** `src/app/api/matches/[id]/result/route.ts` (line 115)
- **What:** Missions don't update after matches
- **Fix:** Track mission progress and completion
- **Estimated effort:** 4-5 hours

### 5. Forum Thread Creation Disabled
- **File:** `src/app/(app)/forum/page.tsx` (line 105)
- **What:** "New Thread" button disabled
- **Fix:** Check if endpoint exists and implement if needed
- **Estimated effort:** 3-4 hours (if not implemented)

### 6. Matchmaker Job Not Started
- **File:** `src/app/api/queue/join/route.ts` (line 61)
- **What:** No automatic matching triggered
- **Fix:** Implement background job/cron
- **Estimated effort:** 4-6 hours

---

## 🟢 LOW (5 Issues - CLEANUP)

### 1. Debug Logging in Auth Routes
- **Files:** 
  - `src/app/api/auth/login/route.ts` (lines 33, 47, 50, 59, 98, 112...)
  - `src/app/api/auth/me/route.ts` (lines 10, 13, 15, 23, 30)
- **What:** Excessive console.log statements
- **Fix:** Remove or gate with DEBUG flag
- **Estimated effort:** 30 minutes each

### 2. Debug Logging in Other Routes
- **Files:**
  - `src/lib/verify-env.ts` (lines 63, 67-68)
  - `src/app/api/health/route.ts` (line 14)
- **What:** Debug output in logs
- **Fix:** Remove or gate appropriately
- **Estimated effort:** 15 minutes each

### 3. Placeholder Data File
- **File:** `src/lib/placeholder-data.ts` (entire file)
- **What:** Hardcoded test data that might be used
- **Fix:** Audit imports, remove if unused
- **Estimated effort:** 1-2 hours

### 4. Support Email Fallback
- **File:** `src/app/api/support/route.ts` (lines 20, 23)
- **What:** Uses 'unknown@example.com' fallback
- **Fix:** Better validation messaging
- **Estimated effort:** 15 minutes

### 5. Placeholder Input Values
- **Files:** Various form inputs
- **What:** UI placeholders like "m@example.com"
- **Fix:** Acceptable, just note them
- **Estimated effort:** 0 (not a problem)

---

## Effort Estimate by Priority

| Priority | Count | Total Hours |
|----------|-------|-------------|
| 🔴 CRITICAL | 6 | 19-30 hours |
| 🟡 HIGH | 6 | 18-25 hours |
| 🟢 LOW | 5 | 2-4 hours |
| **TOTAL** | **17** | **39-59 hours** |

---

## Fix Order Recommendation

1. **Week 1 - Core Functionality**
   - GCP server orchestration (blocking other features)
   - Admin dashboard stats (quick visibility)
   - Chat database migration (user-facing)

2. **Week 2 - Matching & Queue**
   - ESR-based matchmaking
   - AC verification in queue
   - Map random selection
   - Matchmaker job

3. **Week 3 - AC System**
   - AC status endpoint
   - Suspicion scoring
   - Auto-ban logic

4. **Week 4 - Polish**
   - Mission tracking
   - Forum threads
   - Debug logging cleanup
   - Placeholder data audit

---

## Files Ready for Production vs. Not Ready

### ✅ PRODUCTION-READY (No critical issues)
- Authentication routes (login/register/steam)
- User profile/settings
- Shop/cosmetics system
- Leaderboards
- Achievements
- Most admin pages

### ❌ NOT PRODUCTION-READY (Critical issues)
- Match creation/result handling
- Queue system
- Chat system
- Anti-cheat system
- GCP orchestration
- Admin dashboard (stats)

---

## Testing Strategy

### Unit Tests Needed
- [ ] ESR-based matching algorithm
- [ ] AC suspicion score calculation
- [ ] Mission progress tracking logic
- [ ] Map rotation logic

### Integration Tests Needed
- [ ] Match creation with real GCP servers
- [ ] AC verification in queue flow
- [ ] End-to-end matchmaking
- [ ] Chat persistence and pagination

### Manual Testing Needed
- [ ] Queue join with AC verification
- [ ] Match spin-up and tear-down
- [ ] Chat message persistence
- [ ] Admin dashboard stats accuracy

---

## Deployment Blockers

🛑 **DO NOT DEPLOY TO PRODUCTION UNTIL:**

1. ✅ Chat migrated to database
2. ✅ GCP orchestration implemented
3. ✅ Matchmaking working (ESR-based)
4. ✅ AC verification in queue
5. ✅ Admin stats showing real data
6. ✅ No hardcoded test data in use
7. ✅ Console.log spam removed

---

## Contact & Questions

For each issue, reference the corresponding detailed section in `FINDINGS_DETAILED.md` for:
- Exact code location
- Current vs. desired behavior
- Implementation pseudocode
- Complexity assessment
- Related files

---

**Last Updated:** December 7, 2025
**Status:** 🔴 17 issues found - 6 critical
