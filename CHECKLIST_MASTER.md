# Master Checklist - Issue Fixes

## 🔴 CRITICAL ISSUES

### [ ] 1. In-Memory Chat Storage
- **File:** `src/app/api/chat/messages/route.ts`
- **Issue:** Chat uses RAM, messages lost on restart
- **Lines:** 5-21 (storage), 85 (limit)
- **Complexity:** High
- **Effort:** 4-6 hours
- **Blocking:** User-facing feature, data loss
- **Steps:**
  - [ ] Create `chat_messages` table schema
  - [ ] Create database migration
  - [ ] Update GET endpoint to query DB with pagination
  - [ ] Update POST endpoint to insert to DB
  - [ ] Test message persistence
  - [ ] Load test with 1000+ messages
- **Dependencies:** Database schema, migrations

---

### [ ] 2. GCP Server Orchestration - createServer()
- **File:** `src/lib/gcp/orchestrator.ts`
- **Issue:** Stub method returns hardcoded localhost
- **Lines:** 27-43
- **Complexity:** High
- **Effort:** 3-4 hours
- **Blocking:** Match creation, player experience
- **Steps:**
  - [ ] Set up GCP Compute API client
  - [ ] Implement VM instance creation from template
  - [ ] Pass match config via startup script
  - [ ] Implement polling for instance readiness
  - [ ] Return actual IP and port
  - [ ] Add error handling and retries
- **Dependencies:** GCP credentials, template setup

---

### [ ] 3. GCP Server Orchestration - waitForServerReady()
- **File:** `src/lib/gcp/orchestrator.ts`
- **Issue:** Stub method just sleeps
- **Lines:** 45-52
- **Complexity:** High
- **Effort:** 3-4 hours
- **Blocking:** Match startup reliability
- **Steps:**
  - [ ] Implement GCP instance status polling
  - [ ] Check instance CPU/memory allocation
  - [ ] Verify CS2 process is running
  - [ ] Check game port responsiveness
  - [ ] Return on ready or timeout
  - [ ] Log detailed status
- **Dependencies:** GCP API, server health check method

---

### [ ] 4. GCP Server Orchestration - shutdownServer()
- **File:** `src/lib/gcp/orchestrator.ts`
- **Issue:** Stub method doesn't delete instances
- **Lines:** 54-62
- **Complexity:** Medium
- **Effort:** 2-3 hours
- **Blocking:** Cost control, resource cleanup
- **Steps:**
  - [ ] Find instance by match ID
  - [ ] Stop instance gracefully
  - [ ] Wait for graceful shutdown
  - [ ] Force stop if timeout
  - [ ] Delete instance
  - [ ] Log completion
- **Dependencies:** GCP API

---

### [ ] 5. GCP Server Orchestration - getServerStatus()
- **File:** `src/lib/gcp/orchestrator.ts`
- **Issue:** Stub always returns 'stopped'
- **Lines:** 64-72
- **Complexity:** Medium
- **Effort:** 2-3 hours
- **Blocking:** Admin monitoring, diagnostics
- **Steps:**
  - [ ] Query GCP for instance status
  - [ ] Check CS2 process status
  - [ ] Return actual state
  - [ ] Add timeout handling
  - [ ] Log status queries
- **Dependencies:** GCP API

---

### [ ] 6. Hardcoded Admin Dashboard Stats
- **File:** `src/app/(app)/admin/page.tsx`
- **Issue:** Shows fake hardcoded numbers
- **Lines:** 22-30
- **Complexity:** Low
- **Effort:** 1-2 hours
- **Blocking:** Admin visibility
- **Steps:**
  - [ ] Convert to `'use client'` if not already
  - [ ] Add useState for stats
  - [ ] Add useEffect to fetch on mount
  - [ ] Call `/api/stats/public`
  - [ ] Call `/api/health`
  - [ ] Count cosmetics from DB
  - [ ] Display real values
  - [ ] Add loading state
  - [ ] Add error handling
- **Dependencies:** Existing API endpoints

---

### [ ] 7. No ESR-Based Matchmaking
- **File:** `src/app/api/matches/create/route.ts`
- **Issue:** Takes first 10 players regardless of skill
- **Lines:** 23-24
- **Complexity:** High
- **Effort:** 4-6 hours
- **Blocking:** Game balance, player satisfaction
- **Steps:**
  - [ ] Get ESR distribution of waiting players
  - [ ] Group by region
  - [ ] Sort by ESR
  - [ ] Create balanced team pairs
  - [ ] Assign to teams fairly (alternating skill)
  - [ ] Log matching algorithm decisions
  - [ ] Test with various skill distributions
- **Dependencies:** Player ESR data

---

### [ ] 8. Hardcoded Map Selection
- **File:** `src/app/api/matches/create/route.ts`
- **Issue:** Always selects "Mirage"
- **Lines:** 29
- **Complexity:** Very Low
- **Effort:** 30 minutes
- **Blocking:** Game variety
- **Steps:**
  - [ ] Create maps array
  - [ ] Implement random selection
  - [ ] Log selected map
- **Dependencies:** None

---

### [ ] 9. Missing AC Verification in Queue
- **File:** `src/app/api/queue/join/route.ts`
- **Issue:** Doesn't check if AC is running
- **Lines:** 43
- **Complexity:** Medium
- **Effort:** 2-3 hours
- **Blocking:** Anti-cheat enforcement
- **Steps:**
  - [ ] Uncomment Redis connection
  - [ ] Check for `ac:heartbeat:{userId}`
  - [ ] Require heartbeat < 5 minutes old
  - [ ] Return 403 if not active
  - [ ] Log AC verification results
  - [ ] Test with mock Redis
- **Dependencies:** Redis, AC client sending heartbeats

---

## 🟡 HIGH PRIORITY ISSUES

### [ ] 10. AC Status Always Returns False
- **File:** `src/app/api/ac/status/route.ts`
- **Issue:** Hardcoded false instead of checking Redis
- **Lines:** 1-30
- **Complexity:** Low
- **Effort:** 1 hour
- **Blocking:** AC monitoring
- **Steps:**
  - [ ] Get Redis client
  - [ ] Check for `ac:heartbeat:{userId}`
  - [ ] Get timestamp from heartbeat
  - [ ] Return actual status
  - [ ] Return last heartbeat time
  - [ ] Test with mock data
- **Dependencies:** Redis setup

---

### [ ] 11. Missing AC Suspicion Scoring
- **File:** `src/app/api/ac/ingest/route.ts`
- **Issue:** TODO comment where scoring should be
- **Lines:** 41
- **Complexity:** High
- **Effort:** 3-4 hours
- **Blocking:** AC detection effectiveness
- **Steps:**
  - [ ] Design suspicion score formula
  - [ ] Calculate points per event
  - [ ] Query user's total suspicion
  - [ ] Update event with score
  - [ ] Flag for review if threshold exceeded
  - [ ] Log score calculations
  - [ ] Document scoring algorithm
- **Dependencies:** Score formula definition

---

### [ ] 12. Missing AC Auto-Ban Logic
- **File:** `src/app/api/ac/ingest/route.ts`
- **Issue:** TODO comment where auto-ban should be
- **Lines:** 42
- **Complexity:** Medium
- **Effort:** 2-3 hours
- **Blocking:** Automated cheat detection
- **Steps:**
  - [ ] Define auto-ban threshold (e.g., >500 suspicion)
  - [ ] Check if threshold exceeded
  - [ ] Mark user as banned
  - [ ] Store ban reason
  - [ ] Notify user via email
  - [ ] Log ban event
  - [ ] Create admin review process for false positives
- **Dependencies:** Suspicion scoring (issue #11)

---

### [ ] 13. Mission Progress Not Tracked
- **File:** `src/app/api/matches/[id]/result/route.ts`
- **Issue:** TODO comment where progress tracking should be
- **Lines:** 115
- **Complexity:** High
- **Effort:** 4-5 hours
- **Blocking:** Mission system, user progression
- **Steps:**
  - [ ] Get user's active missions
  - [ ] Check each mission's requirement type
  - [ ] Match requirement to match result
  - [ ] Update mission progress
  - [ ] Check for completion
  - [ ] Award XP/coins on completion
  - [ ] Emit progress update events
  - [ ] Test with various mission types
- **Dependencies:** Mission requirement types defined

---

### [ ] 14. Hardcoded Region Setting
- **File:** `src/app/api/queue/join/route.ts`
- **Issue:** Always 'EU', should come from user settings
- **Lines:** 57
- **Complexity:** Low
- **Effort:** 1 hour
- **Blocking:** Regional matchmaking
- **Steps:**
  - [ ] Add region field to user profile
  - [ ] Fetch user's region preference
  - [ ] Use in queue ticket
  - [ ] Default to 'EU' if not set
- **Dependencies:** User profile schema

---

### [ ] 15. Matchmaker Job Not Started
- **File:** `src/app/api/queue/join/route.ts`
- **Issue:** TODO comment where job should start
- **Lines:** 61
- **Complexity:** High
- **Effort:** 4-6 hours
- **Blocking:** Automatic match creation
- **Steps:**
  - [ ] Choose job system (Bull, RabbitMQ, cron)
  - [ ] Create matchmaker job handler
  - [ ] Query waiting players
  - [ ] Run matching algorithm
  - [ ] Create match
  - [ ] Notify players
  - [ ] Schedule periodic execution (every 10 seconds)
  - [ ] Add logging and metrics
- **Dependencies:** Job queue setup

---

### [ ] 16. Forum Thread Creation Disabled
- **File:** `src/app/(app)/forum/page.tsx`
- **Issue:** Button is disabled, feature unclear
- **Lines:** 105-109
- **Complexity:** Medium
- **Effort:** 3-4 hours
- **Blocking:** Community feature
- **Steps:**
  - [ ] Check if `/api/forum/threads/create` exists
  - [ ] If not, implement endpoint
  - [ ] Create dialog/form for thread creation
  - [ ] Enable button
  - [ ] Test end-to-end
- **Dependencies:** Forum API endpoints

---

## 🟢 LOW PRIORITY ISSUES

### [ ] 17. Debug Logging - Auth Login Route
- **File:** `src/app/api/auth/login/route.ts`
- **Issue:** Multiple console.log statements
- **Lines:** 33, 47, 50, 59, 98, 112, etc.
- **Complexity:** Very Low
- **Effort:** 30 minutes
- **Blocking:** None (logs pollution)
- **Steps:**
  - [ ] Remove or replace with logger
  - [ ] Keep ERROR level only
  - [ ] Use structured logging if available
  - [ ] Test login flow
- **Dependencies:** Logging framework (optional)

---

### [ ] 18. Debug Logging - Auth Me Route
- **File:** `src/app/api/auth/me/route.ts`
- **Issue:** Multiple console.log statements
- **Lines:** 10, 13, 15, 23, 30, 101
- **Complexity:** Very Low
- **Effort:** 30 minutes
- **Blocking:** None
- **Steps:**
  - [ ] Remove debug logs
  - [ ] Keep errors only
  - [ ] Test user fetch
- **Dependencies:** None

---

### [ ] 19. Debug Logging - Other Routes
- **Files:**
  - `src/lib/verify-env.ts` (lines 63, 67-68)
  - `src/app/api/health/route.ts` (line 14)
- **Complexity:** Very Low
- **Effort:** 15 minutes per file
- **Steps:**
  - [ ] Remove console.log calls
  - [ ] Keep console.error for actual errors
  - [ ] Test affected routes
- **Dependencies:** None

---

### [ ] 20. Placeholder Data File Audit
- **File:** `src/lib/placeholder-data.ts`
- **Issue:** Entire file of test data
- **Lines:** 1-338
- **Complexity:** Low
- **Effort:** 1-2 hours
- **Blocking:** None (if not used)
- **Steps:**
  - [ ] Search for imports: `grep -r "placeholder-data" src/`
  - [ ] For each import found:
    - [ ] Check if production code
    - [ ] Replace with API call or remove
  - [ ] If no imports, delete file safely
  - [ ] Run tests to verify
- **Dependencies:** None

---

## Summary Statistics

| Category | Count | Total Hours | Status |
|----------|-------|-------------|--------|
| Critical | 9 | 22-31 | ⚠️ Not started |
| High | 7 | 18-25 | ⚠️ Not started |
| Low | 4 | 2-3.5 | ⚠️ Not started |
| **TOTAL** | **20** | **42-59.5** | 🔴 **BLOCKED** |

---

## Completion Tracking

**Start Date:** _________________  
**Target Date:** _________________

### Week 1: Foundation (Critical Core)
- [ ] 1. In-Memory Chat Storage → Database
- [ ] 3. GCP createServer() implementation
- [ ] 6. Admin dashboard real stats
- **Hours this week:** _______

### Week 2: Matching & Queue
- [ ] 2. GCP waitForServerReady() implementation
- [ ] 4. GCP shutdownServer() implementation
- [ ] 7. ESR-based matchmaking
- [ ] 8. Map random selection
- **Hours this week:** _______

### Week 3: AC & Matchmaker
- [ ] 5. GCP getServerStatus() implementation
- [ ] 9. AC verification in queue
- [ ] 10. AC status endpoint fix
- [ ] 15. Matchmaker background job
- **Hours this week:** _______

### Week 4: Polish & Completion
- [ ] 11. AC suspicion scoring
- [ ] 12. AC auto-ban logic
- [ ] 13. Mission progress tracking
- [ ] 14. Region preference
- [ ] 16. Forum thread creation
- **Hours this week:** _______

### Week 5: Cleanup
- [ ] 17-19. Remove debug logging
- [ ] 20. Placeholder data audit
- [ ] Full testing & QA
- [ ] Production readiness review
- **Hours this week:** _______

---

**Document Last Updated:** December 7, 2025
