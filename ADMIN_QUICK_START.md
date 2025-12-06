# 🎮 ADMIN QUICK START - REQUIREMENT TYPES SYSTEM

## 📍 Quick Links

| Page | URL | Purpose |
|------|-----|---------|
| **Admin Dashboard** | `/admin` | See all 41 requirement types & reference guide |
| **Missions** | `/admin/missions` | Create missions with 16 requirement types |
| **Achievements** | `/admin/achievements` | Create achievements with 16 requirement types |
| **Badges** | `/admin/badges` | Manage badges with 6 requirement types |
| **ESR Ranks** | `/admin/esr-tiers` | Configure 15 ESR tier thresholds |

---

## 🎮 MISSIONS - How to Create

1. Go to `/admin/missions`
2. Fill in:
   - **Title**: Mission name (e.g., "5 Kill Spree")
   - **Description**: What players need to do
   - **Category**: DAILY / PLATFORM / INGAME
   - **Requirement Type**: SELECT from dropdown ↓
   - **Requirement Value**: Number (e.g., 5 for 5 kills)
   - **Reward XP**: XP players earn
   - **Reward Coins**: Coins players earn
3. Click "Create Mission"
4. Done! ✅

### Mission Requirement Types (Pick One)

```
KILLS               → Kill X enemies
DEATHS              → Lose X deaths (for penalty missions)
ASSISTS             → Get X assists
HEADSHOTS           → Kill X with headshots
WINS                → Win X matches
MATCHES_PLAYED      → Play X matches
BOMB_PLANTS         → Plant bomb X times
BOMB_DEFUSES        → Defuse bomb X times
CLUTCHES_WON        → Win X clutches (1vX situations)
MVP_EARNED          → Get MVP X times
CONSECUTIVE_WINS    → Win X matches in a row
OBJECTIVE_ROUNDS    → Win X objective rounds
DAMAGE_DEALT        → Deal X damage total
MONEY_EARNED        → Earn X in-game money
ROUNDS_PLAYED       → Play X rounds
TIMESPAN_DAYS       → Complete within X days (for DAILY missions)
```

---

## 🏆 ACHIEVEMENTS - How to Create

1. Go to `/admin/achievements`
2. Fill in:
   - **Title**: Achievement name (e.g., "Level 50")
   - **Description**: What achievment is for
   - **Category**: LEVEL / ESR / COMBAT / SOCIAL / PLATFORM / COMMUNITY
   - **Requirement Type**: SELECT from dropdown ↓
   - **Requirement Value**: Number (e.g., 50 for level 50)
   - **Progress Required**: Same as requirement value (for progress tracking)
   - **Is Repeatable**: Yes/No checkbox
3. Click "Create Achievement"
4. Done! ✅

### Achievement Requirement Types (Pick One)

```
LEVEL_REACH             → Reach level X
ESR_REACH               → Reach ESR tier X
KILL_MILESTONE          → Get X total kills
WIN_STREAK              → Win X consecutive matches
MATCH_COUNT             → Play X total matches
MVP_COUNT               → Get MVP X times
HEADSHOT_PERCENTAGE     → Achieve X% headshot ratio
CLUTCH_SUCCESS          → Win X clutches
DAMAGE_MILESTONE        → Deal X total damage
PLAYTIME_HOURS          → Play for X hours
SOCIAL_FRIENDS          → Add X friends
FORUM_POSTS             → Make X forum posts
ACHIEVEMENT_COLLECTOR   → Unlock X achievements
BADGE_COLLECTOR         → Collect X badges
COMMUNITY_CONTRIBUTOR   → Earn X community points
TOURNAMENT_PLACED       → Place top X in tournament
```

---

## 🏅 BADGES - How to Create (NEW)

1. Go to `/admin/badges`
2. Fill in:
   - **Title**: Badge name (e.g., "Master Tactician")
   - **Description**: What the badge represents
   - **Rarity**: COMMON / RARE / EPIC / LEGENDARY
   - **Requirement Type**: SELECT from dropdown ↓
   - **Requirement Value**: ID or reference (varies by type)
   - **Image URL**: Link to badge image
3. Click "Create Badge"
4. Done! ✅

### Badge Requirement Types (Pick One)

```
ACHIEVEMENT_UNLOCK   → Unlock specific achievement (value: achievement_id)
BATTLE_PASS_TIER     → Reach battle pass tier (value: tier number)
PURCHASE_COSMETIC    → Buy specific cosmetic (value: cosmetic_id)
SEASONAL_RANK        → Reach seasonal rank (value: rank tier)
TOURNAMENT_VICTORY   → Win tournament (value: tournament_id)
REFERRAL_COUNT       → Refer X friends (value: number)
```

---

## 📊 ESR RANKS - How to Configure (NEW)

1. Go to `/admin/esr-tiers`
2. Fill in:
   - **Tier**: SELECT (Beginner / Rookie / Pro / Ace / Legend)
   - **Division**: SELECT (I / II / III)
   - **Min ESR**: Lowest ESR for this tier
   - **Max ESR**: Highest ESR for this tier
3. Click "Create Tier"
4. Done! ✅

### Pre-Configured ESR Structure

```
Beginner I       0 - 500 ESR
Beginner II      500 - 750 ESR
Beginner III     750 - 900 ESR
Rookie I         900 - 1000 ESR
Rookie II        1000 - 1150 ESR
Rookie III       1150 - 1300 ESR
Pro I            1300 - 1500 ESR
Pro II           1500 - 1700 ESR
Pro III          1700 - 1900 ESR
Ace I            1900 - 2000 ESR
Ace II           2000 - 2100 ESR
Ace III          2100 - 2200 ESR
Legend I         2200+ ESR
Legend II        2300+ ESR (Elite)
Legend III       2500+ ESR (Legendary)
```

---

## ✨ NEW FEATURES

### ✅ Requirement Type Dropdowns
- No more typing requirement types manually
- Can't make typos
- Always consistent
- Self-documenting

### ✅ Requirement Value Fields
- Separate field for the number/value
- Clear what's being measured
- Type-safe input

### ✅ Color-Coded Badges
- Type shows as colored badge in table
- Easy to scan and verify
- Visual feedback

### ✅ Admin Dashboard
- See ALL 41 requirement types in one place
- Reference guide for admins
- Platform overview
- System status

### ✅ Badge Management System (NEW)
- Full control over cosmetic badges
- Link to achievements or cosmetics
- Rarity levels

### ✅ ESR Tier Configuration (NEW)
- Modify tier thresholds
- Auto-generate tier labels
- See complete tier structure

---

## 🎯 Common Scenarios

### Create a Daily Mission
1. Go to `/admin/missions`
2. Select **Category**: DAILY
3. Select **Requirement Type**: KILLS
4. Enter **Requirement Value**: 10
5. Set rewards and create
6. Players must get 10 kills within the day ✓

### Create an Achievement
1. Go to `/admin/achievements`
2. Select **Category**: COMBAT
3. Select **Requirement Type**: KILL_MILESTONE
4. Enter **Requirement Value**: 1000
5. Create
6. Players must get 1000 total kills to unlock ✓

### Award a Badge
1. Go to `/admin/badges`
2. Set **Requirement Type**: ACHIEVEMENT_UNLOCK
3. Set **Requirement Value**: (achievement_id)
4. Set **Rarity**: EPIC
5. Create
6. Badge given when player unlocks that achievement ✓

### Configure Tier
1. Go to `/admin/esr-tiers`
2. Select **Tier**: Pro
3. Select **Division**: II
4. Set **Min ESR**: 1500
5. Set **Max ESR**: 1700
6. Create
7. Players in 1500-1700 ESR get Pro II rank ✓

---

## 📱 Tips & Tricks

### Naming Conventions
- **Missions**: "5 Kill Spree", "Plant 3 Bombs", "Win 5 Matches"
- **Achievements**: "Level 50 Master", "Ace Killer", "Social Butterfly"
- **Badges**: "Tournament Champion", "Veteran Player", "Friendly"

### Requirement Value Guidelines
- **Kills**: 1-100 (based on mission difficulty)
- **Matches**: 1-50 (based on season length)
- **Damage**: 100-10000 (scale to mission difficulty)
- **Hours**: 1-1000 (based on achievement difficulty)

### Rarity Levels
- **COMMON**: Easy to get (90% of players)
- **RARE**: Moderate difficulty (50% of players)
- **EPIC**: Hard to get (10% of players)
- **LEGENDARY**: Very rare (<1% of players)

---

## ❓ FAQ

**Q: Can I edit existing missions/achievements?**  
A: Yes! Click Edit button in the table, modify fields, and click Update.

**Q: Can I delete requirement types?**  
A: No - requirement types are predefined. Delete the mission/achievement instead.

**Q: What if I need a new requirement type?**  
A: Contact development team - they're defined in constants.

**Q: How do players see these requirements?**  
A: They see missions in `/missions` and achievements in profile - both show requirement type.

**Q: Can I duplicate a mission?**  
A: No - create manually or ask development team for export/import feature.

**Q: What happens if I set wrong ESR tiers?**  
A: Players may be misclassified. Update tiers and system recalculates on next login.

---

## 🎊 You're Ready!

Everything is set up and working. Start creating:
1. **Missions** with requirement types
2. **Achievements** with progression tracking
3. **Badges** for cosmetics
4. **ESR Tiers** for ranking

Questions? Check `/admin` dashboard for complete reference guide!

---

**Last Updated:** December 6, 2025  
**System Status:** ✅ Production Ready
