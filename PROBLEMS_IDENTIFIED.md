# 21 PROBLEMS IDENTIFIED & FIXES REQUIRED

## Database Schema Issues (5 problems)
1. ❌ **Missions table doesn't exist** - Legacy Prisma schema has no "missions" table
   - FIX: Create proper missions table with all fields from spec
   
2. ❌ **Achievements table missing fields** - Only has id/code/name/description/points
   - FIX: Add category, requirementType, requirementValue, target, rewardXp, rewardBadgeId, isSecret
   
3. ❌ **Badges table schema is wrong** - Current schema doesn't match BadgeDefinition
   - FIX: Update badges table with rarity, iconKey fields
   
4. ❌ **No userMissionProgress table** - Can't track mission progress
   - FIX: Create table with userId, missionId, progress, completed, completedAt
   
5. ❌ **user_achievements table doesn't track progress properly**
   - FIX: Ensure it has all required fields for progress tracking

## Seeding Issues (3 problems)
6. ❌ **Missions not seeded** - Script created but never executed due to missing table
   - FIX: Create missions table first, then seed 55 missions
   
7. ❌ **Achievements seeded with wrong data** - Only 45 achievements, should be 50
   - FIX: Seed all 50 achievements from spec with correct fields
   
8. ❌ **Badges never seeded** - No badge data in database
   - FIX: Seed all 50 badges from spec

## API Endpoint Issues (4 problems)
9. ❌ **Mission API doesn't filter by category correctly**
   - FIX: Update GET /api/missions to properly filter DAILY/PLATFORM/CS2
   
10. ❌ **Achievement progress tracking wrong**
    - FIX: API expects different field names than database has
    
11. ❌ **Admin endpoints don't validate mission data**
    - FIX: Add validation for category, requirementType, target, rewards
    
12. ❌ **Mission progress endpoint doesn't handle requirementValue**
    - FIX: Support optional requirementValue field for level/ESR requirements

## UI Component Issues (4 problems)
13. ❌ **Missions page doesn't show requirementType**
    - FIX: Display requirement info (kills, matches, level, etc.)
    
14. ❌ **Achievements page missing category filtering**
    - FIX: Add all 6 categories: platform, cs2, social, cosmetic, progression, event
    
15. ❌ **Admin panels don't show all fields**
    - FIX: Add requirementType, requirementValue, isSecret fields to forms
    
16. ❌ **Progress bars don't work with non-numeric requirements**
    - FIX: Handle special requirements like profile_complete, verify_email, etc.

## Configuration Issues (3 problems)
17. ❌ **No TypeScript constants file**
    - FIX: Create constants/missions.ts matching the spec types exactly
    
18. ❌ **Mission categories hardcoded** - Should be from spec: platform/cs2/social/cosmetic/progression/event
    - FIX: Update all references to use correct categories
    
19. ❌ **Rarity enum not defined** - Should be: common/uncommon/rare/epic/legendary/mythic/celestial
    - FIX: Define Rarity type properly

## Testing Issues (2 problems)
20. ❌ **No test data verification script**
    - FIX: Create script to verify all 55 missions, 50 achievements, 50 badges exist
    
21. ❌ **No end-to-end test flow**
    - FIX: Create test script that verifies mission creation, achievement unlock, badge grant

---

## IMPLEMENTATION PLAN

**Phase 1**: Fix database schema (2 hours)
- Create missions table
- Update achievements table
- Update badges table
- Create userMissionProgress table
- Run migrations

**Phase 2**: Seed data (1 hour)
- Seed 55 missions from spec
- Seed 50 achievements from spec
- Seed 50 badges from spec

**Phase 3**: Fix APIs (1 hour)
- Update endpoint validation
- Fix field mapping
- Test all endpoints

**Phase 4**: Fix UI (1 hour)
- Update admin panels with all fields
- Update user pages with proper display
- Add category filters

**Phase 5**: Test everything (30 min)
- Verify database data
- Test all endpoints
- Test admin panels
- Test user pages

**Total Time**: ~5.5 hours
