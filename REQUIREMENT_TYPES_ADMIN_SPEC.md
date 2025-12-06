# 🎯 REQUIREMENT TYPES FOR ADMIN PANEL - COMPLETE SPECIFICATION

## Overview

The admin panel is missing **Requirement Type dropdowns** for missions, achievements, badges, and ranks. These allow admins to select HOW a mission/achievement is completed.

---

## 📋 REQUIREMENT TYPES BY SYSTEM

### 1️⃣ MISSION REQUIREMENT TYPES

When creating a mission in `/admin/missions`, admins should select:

```
KILLS                    - Kill enemy players (value: number of kills)
DEATHS                   - Get kills with specific death count (value: deaths allowed)
ASSISTS                  - Get teammate assists (value: number)
HEADSHOTS              - Kill with headshots (value: number)
WINS                     - Win matches (value: number)
MATCHES_PLAYED         - Play matches (value: number)
BOMB_PLANTS            - Plant bombs (value: number)
BOMB_DEFUSES           - Defuse bombs (value: number)
CLUTCHES_WON           - Win 1v5/1v4/etc (value: clutch count)
MVP_EARNED             - Get MVP in matches (value: number)
CONSECUTIVE_WINS       - Win X matches in a row (value: consecutive count)
OBJECTIVE_ROUNDS       - Win objective rounds (value: number)
DAMAGE_DEALT           - Deal total damage (value: damage amount)
MONEY_EARNED           - Earn in-game money (value: amount)
ROUNDS_PLAYED          - Play rounds (value: number)
TIMESPAN_DAYS          - Complete within X days (value: days) - DAILY MISSIONS ONLY
```

### 2️⃣ ACHIEVEMENT REQUIREMENT TYPES

When creating achievements in `/admin/achievements`, admins should select:

```
LEVEL_REACH            - Reach a specific level (value: level number)
ESR_REACH              - Reach a specific ESR tier (value: tier name like "Gold III")
KILL_MILESTONE         - Get X total kills (value: kill count)
WIN_STREAK             - Win X consecutive matches (value: streak count)
MATCH_COUNT            - Play X total matches (value: match count)
MVP_COUNT              - Get MVP X times (value: count)
HEADSHOT_PERCENTAGE    - Achieve X% headshot ratio (value: percentage 0-100)
CLUTCH_SUCCESS         - Win X clutches (value: count)
DAMAGE_MILESTONE       - Deal X total damage (value: damage amount)
PLAYTIME_HOURS         - Play for X hours (value: hours)
SOCIAL_FRIENDS         - Add X friends (value: count)
FORUM_POSTS            - Make X forum posts (value: count)
ACHIEVEMENT_COLLECTOR  - Unlock X achievements (value: count)
BADGE_COLLECTOR        - Collect X badges (value: count)
COMMUNITY_CONTRIBUTOR  - Earn X community points (value: points)
TOURNAMENT_PLACED      - Place top X in tournament (value: placement number)
```

### 3️⃣ RANK/ESR TIER REQUIREMENT TYPES

For rank progression settings (in settings/admin), admins configure:

```
ESR_POINTS             - Specific ESR point requirement (value: ESR points 0-2500)
WIN_RATE               - Achieve X% win rate (value: percentage)
MINIMUM_MATCHES        - Play minimum X matches (value: match count)
SEASONAL_PLACEMENT     - Ranked placement in season (value: any)
```

### 4️⃣ BADGE REQUIREMENT TYPES

When assigning badges to achievements/cosmetics:

```
ACHIEVEMENT_UNLOCK     - Unlock a specific achievement (value: achievement_id)
BATTLE_PASS_TIER       - Reach battle pass tier (value: tier number)
PURCHASE_COSMETIC      - Buy a specific cosmetic (value: cosmetic_id)
SEASONAL_RANK          - Reach seasonal rank (value: rank tier name)
TOURNAMENT_VICTORY     - Win a tournament (value: tournament_id)
REFERRAL_COUNT         - Refer X friends (value: count)
```

### 5️⃣ RANK TIER REQUIREMENT TYPES

For ESR threshold settings:

```
ESR_MINIMUM            - Minimum ESR needed (value: ESR points)
ESR_MAXIMUM            - Maximum ESR allowed (value: ESR points)
DIVISION_POINT         - ESR at division boundary (value: ESR points)
```

---

## 🎮 CURRENT ESR TIER STRUCTURE

The system uses this tier framework (should be in dropdowns for achievements):

```
TIER → ESR RANGE (Min - Max)
├── Beginner
│   ├── Division I:     0 - 500 ESR
│   ├── Division II:    500 - 750 ESR
│   └── Division III:   750 - 900 ESR
├── Rookie
│   ├── Division I:     900 - 1000 ESR
│   ├── Division II:    1000 - 1150 ESR
│   └── Division III:   1150 - 1300 ESR
├── Pro
│   ├── Division I:     1300 - 1500 ESR
│   ├── Division II:    1500 - 1700 ESR
│   └── Division III:   1700 - 1900 ESR
├── Ace
│   ├── Division I:     1900 - 2000 ESR
│   ├── Division II:    2000 - 2100 ESR
│   └── Division III:   2100 - 2200 ESR
└── Legend
    ├── Division I:     2200+ ESR
    ├── Division II:    2300+ ESR (Elite)
    └── Division III:   2500+ ESR (Legendary)
```

---

## 🔧 IMPLEMENTATION - WHAT NEEDS TO BE ADDED

### Missing UI Components for Admin Panels

#### 1. Missions Admin (`/admin/missions`)
```tsx
// Add this Select component
<Select
  value={formData.requirementType}
  onValueChange={(val) => setFormData({ ...formData, requirementType: val })}
>
  <SelectTrigger className="bg-gray-800 border-gray-700">
    <SelectValue placeholder="Select requirement type" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="KILLS">Kills</SelectItem>
    <SelectItem value="DEATHS">Deaths</SelectItem>
    <SelectItem value="ASSISTS">Assists</SelectItem>
    <SelectItem value="HEADSHOTS">Headshots</SelectItem>
    <SelectItem value="WINS">Wins</SelectItem>
    <SelectItem value="MATCHES_PLAYED">Matches Played</SelectItem>
    <SelectItem value="BOMB_PLANTS">Bomb Plants</SelectItem>
    <SelectItem value="BOMB_DEFUSES">Bomb Defuses</SelectItem>
    <SelectItem value="CLUTCHES_WON">Clutches Won</SelectItem>
    <SelectItem value="MVP_EARNED">MVP Earned</SelectItem>
    <SelectItem value="CONSECUTIVE_WINS">Consecutive Wins</SelectItem>
    <SelectItem value="OBJECTIVE_ROUNDS">Objective Rounds</SelectItem>
    <SelectItem value="DAMAGE_DEALT">Damage Dealt</SelectItem>
    <SelectItem value="MONEY_EARNED">Money Earned</SelectItem>
    <SelectItem value="ROUNDS_PLAYED">Rounds Played</SelectItem>
    <SelectItem value="TIMESPAN_DAYS">Timespan (Days)</SelectItem>
  </SelectContent>
</Select>

// Rename and update input label
<Input
  placeholder="Requirement Value"  // Changed from "Objective Value"
  type="number"
  value={formData.requirementValue || ''}
  onChange={(e) => setFormData({ ...formData, requirementValue: e.target.value })}
  className="bg-gray-800 border-gray-700"
/>
```

#### 2. Achievements Admin (`/admin/achievements`)
```tsx
// Add this Select component
<Select
  value={formData.requirementType}
  onValueChange={(val) => setFormData({ ...formData, requirementType: val })}
>
  <SelectTrigger className="bg-gray-800 border-gray-700">
    <SelectValue placeholder="Select requirement type" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="LEVEL_REACH">Level Reach</SelectItem>
    <SelectItem value="ESR_REACH">ESR Reach</SelectItem>
    <SelectItem value="KILL_MILESTONE">Kill Milestone</SelectItem>
    <SelectItem value="WIN_STREAK">Win Streak</SelectItem>
    <SelectItem value="MATCH_COUNT">Match Count</SelectItem>
    <SelectItem value="MVP_COUNT">MVP Count</SelectItem>
    <SelectItem value="HEADSHOT_PERCENTAGE">Headshot %</SelectItem>
    <SelectItem value="CLUTCH_SUCCESS">Clutch Success</SelectItem>
    <SelectItem value="DAMAGE_MILESTONE">Damage Milestone</SelectItem>
    <SelectItem value="PLAYTIME_HOURS">Playtime (Hours)</SelectItem>
    <SelectItem value="SOCIAL_FRIENDS">Friends Added</SelectItem>
    <SelectItem value="FORUM_POSTS">Forum Posts</SelectItem>
    <SelectItem value="ACHIEVEMENT_COLLECTOR">Achievement Collector</SelectItem>
    <SelectItem value="BADGE_COLLECTOR">Badge Collector</SelectItem>
    <SelectItem value="COMMUNITY_CONTRIBUTOR">Community Contributor</SelectItem>
    <SelectItem value="TOURNAMENT_PLACED">Tournament Placed</SelectItem>
  </SelectContent>
</Select>

// Add requirement value input
<Input
  placeholder="Requirement Value"
  value={formData.requirementValue || ''}
  onChange={(e) => setFormData({ ...formData, requirementValue: e.target.value })}
  className="bg-gray-800 border-gray-700"
/>
```

#### 3. Admin Ranks/Tiers Settings (NEW PAGE)
```
Path: /admin/esr-settings
Allows admins to configure ESR tier thresholds and requirements
```

---

## 📊 DATA MAPPING

### How Requirement Types Flow Through System

1. **Admin Creates Mission/Achievement**
   - Selects `requirementType` (e.g., "KILLS")
   - Enters `requirementValue` (e.g., "50")

2. **Game Tracks Events**
   - When player gets kills, system increments kill counter
   - Checks: `currentKills >= requirementValue`?

3. **Mission/Achievement Unlocks**
   - If check passes → unlock achievement
   - Award badge + XP + coins

4. **User Sees Progress**
   - Dashboard shows: "50/50 Kills ✅"
   - Or: "37/50 Kills (74%)" if incomplete

---

## ✅ WHAT'S ALREADY IN DATABASE

Looking at the database and API routes:

```sql
SELECT DISTINCT requirement_type FROM missions;
SELECT DISTINCT requirement_type FROM achievements;
```

The fields already exist in the schema:
- `missions.requirementType` ✅
- `missions.requirementValue` ✅
- `achievements.requirementType` ✅
- `achievements.requirementValue` ✅

**The admin panel UI just needs dropdowns added!**

---

## 🚀 PRIORITY - WHAT TO BUILD NEXT

### HIGH PRIORITY
1. ✅ Add requirementType dropdown to Missions admin
2. ✅ Add requirementValue input to Missions admin
3. ✅ Add requirementType dropdown to Achievements admin
4. ✅ Add requirementValue input to Achievements admin
5. ✅ Create Badges admin with requirement types
6. ✅ Create Ranks/Tiers settings page

### MEDIUM PRIORITY
7. Add requirement type documentation in UI (tooltips)
8. Create requirement value validation per type
9. Add requirement type templates/presets

### LOW PRIORITY
10. Add bulk edit for requirement types
11. Add requirement type history/audit log

---

## 📝 ADMIN PANEL CHECKLIST

- [ ] Missions form: Add requirementType dropdown
- [ ] Missions form: Add requirementValue input
- [ ] Missions form: Remove/rename objectiveValue to requirementValue
- [ ] Achievements form: Add requirementType dropdown
- [ ] Achievements form: Add requirementValue input
- [ ] Achievements form: Remove metricType field (use requirementType instead)
- [ ] Create Badges admin page with forms
- [ ] Create ESR Ranks settings page
- [ ] Add requirement type tooltips/help text
- [ ] Test all requirement types in backend

