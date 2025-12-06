# 🎮 Eclip.pro Admin Panel - Quick Start Guide

**For**: Site Administrators  
**Updated**: December 6, 2025  
**Status**: Ready to Use

---

## 🚀 Getting Started

### Access Admin Panel
1. Log in with admin account
2. Navigate to `/admin`
3. See dashboard with all management options

---

## 📋 Main Admin Sections

### 1. 🎨 Site Configuration (`/admin/config`)

**What it does**: Manage how your landing page and website looks

**Appearance Tab**:
- Upload/change logo
- Adjust logo size
- Set favicon
- Change site name and tagline

**Landing Page Tab**:
- Change hero title (main headline)
- Change hero subtitle
- Upload hero banner image
- Edit CTA button text ("Play Now", etc.)
- Edit CTA button link

**Features Tab**:
- Toggle maintenance mode
- Enable/disable social features
- Enable/disable forum
- Enable/disable VIP features
- Enable/disable cosmetic shop
- Enable/disable missions
- Enable/disable achievements

**Economy Tab**:
- Set coins reward per win
- Set coins reward per loss
- Set XP reward per win
- Set XP reward per loss

**Contact Tab**:
- Add support email
- Add Discord server link
- Add Twitter/X link

**How to use**:
1. Go to `/admin/config`
2. Choose a tab
3. Make your changes
4. Click "Save [Section Name]"
5. Changes appear on website immediately

---

### 2. 👥 Users Management (`/admin/users`)

**What it does**: Manage player accounts

**Features**:
- View all users
- Search by username or email
- Edit user information:
  - Change role (USER, VIP, ADMIN)
  - Modify ESR (rating)
  - Adjust rank tier and division
  - Set level
  - Award/remove coins
  - Add/remove XP

**How to use**:
1. Go to `/admin/users`
2. Search for player by name
3. Click on player
4. Edit their stats
5. Save changes
6. Player data updates immediately

---

### 3. 🎯 Missions (`/admin/missions`)

**What it does**: Create daily/weekly missions for players

**Mission Types**:
- **Daily**: 5 daily missions (reset every day)
- **Weekly**: Longer objectives
- **Achievement**: One-time special missions

**How to create**:
1. Go to `/admin/missions`
2. Click "Create Mission"
3. Fill in details:
   - Title: "Get 5 kills"
   - Category: "DAILY"
   - Requirement: "KILLS"
   - Target: 5
   - Rewards: 100 XP + 50 coins
4. Click "Create"
5. Players see new mission in their list

**Requirement Types**:
- Kills
- Deaths
- Assists
- Headshots
- Wins
- Matches played
- Bomb plants
- Bomb defuses
- Clutches won
- MVP earned
- And 6 more...

---

### 4. 🏆 Achievements (`/admin/achievements`)

**What it does**: Create achievement unlocks with badge rewards

**Categories**:
- Level-based
- ESR-based
- Combat-based
- Social-based
- Platform-based
- Community-based

**How to create**:
1. Go to `/admin/achievements`
2. Click "Create Achievement"
3. Fill in:
   - Name: "Headshot Master"
   - Category: "COMBAT"
   - Requirement: "HEADSHOTS"
   - Target: 100
   - Reward badge: (select from list)
   - Reward XP: 500
4. Click "Create"
5. Players unlock automatically when they reach target

---

### 5. 🎖️ Badges (`/admin/badges`)

**What it does**: Create badges that players can earn

**How to create**:
1. Go to `/admin/badges`
2. Click "Create Badge"
3. Fill in:
   - Name: "Pro Player"
   - Description: "Reached Radiant rank"
   - Rarity: "Epic"
   - Image URL: (link to image)
   - Link to achievement/mission
4. Click "Create"
5. Players earn when they unlock the achievement

---

### 6. 🎁 Cosmetics (`/admin/cosmetics`)

**What it does**: Manage profile cosmetics players can buy

**Types**:
- Frames (profile border)
- Banners (profile header)
- Badges (profile decoration)
- Titles (custom username title)

**How to create**:
1. Go to `/admin/cosmetics`
2. Click "Create Cosmetic"
3. Fill in:
   - Name: "Golden Frame"
   - Type: "Frame"
   - Rarity: "Legendary"
   - Price: 500 coins
   - Image URL: (link to image)
4. Click "Create"
5. Players can buy from shop

**How to edit**:
1. Find cosmetic in list
2. Click "Edit"
3. Change price, image, or rarity
4. Click "Save"
5. Changes appear in shop immediately

---

### 7. 🎮 Matches (`/admin/matches`)

**What it does**: Track and manage match results

**Features**:
- View all matches
- See scores and stats
- Edit match results
- Adjust scores if needed
- Change map
- Update match status

**How to use**:
1. Go to `/admin/matches`
2. Find match in list
3. Click to view details
4. Edit scores if needed
5. Save changes

---

### 8. 🛡️ Anti-Cheat (`/admin/anti-cheat`)

**What it does**: Review suspicious player behavior

**Features**:
- See AC events
- Filter by severity (1-5)
- Review and approve/deny
- Ban suspicious players
- Add notes

**How to use**:
1. Go to `/admin/anti-cheat`
2. See list of flagged events
3. Click event to review
4. Click "Ban User" or "Clear Suspicion"
5. Action applied immediately

---

### 9. 🏅 ESR Tiers (`/admin/esr-tiers`)

**What it does**: Configure the ranking system

**Tier Structure**:
- 15 tiers total
- 3 divisions each
- 45 total ranks (Bronze I to Radiant I)

**How to configure**:
1. Go to `/admin/esr-tiers`
2. See all tiers
3. Edit ESR ranges
4. Change colors
5. Save changes

---

## 📊 Real-Time Stats

The landing page shows LIVE stats:
- Online players (from queue)
- Active matches (in progress)
- Total coins (all players combined)
- Total users (registered accounts)
- All-time matches (total ever played)

**These update automatically** when:
- New player joins queue
- Match starts/ends
- Admin awards coins
- New user registers
- New match is played

**Stats refresh** when user refreshes landing page. No manual update needed.

---

## 💾 Saving Settings

**Two types of saves**:

### Config Settings (auto-save to database)
- Site appearance
- Landing page content
- Feature flags
- Economy settings
- Contact info

**Each section has its own "Save" button**

### User/Content Changes (instant)
- User edits
- Mission creation
- Achievement creation
- Cosmetic changes
- Match results

**All changes are instant and persistent**

---

## 🔍 Quick Admin Tasks

### Task: Change landing page title
1. Go to `/admin/config`
2. Click "Landing Page" tab
3. Find "Hero Title" field
4. Change from "The Ultimate Competitive Experience" to your title
5. Click "Save Landing Page"
6. Landing page updates immediately

### Task: Award coins to top player
1. Go to `/admin/users`
2. Search for player name
3. Find "Coins" field
4. Add amount
5. Click "Save"
6. Total coins on landing page increases

### Task: Create daily mission
1. Go to `/admin/missions`
2. Click "Create Mission"
3. Title: "Get 10 kills"
4. Category: "DAILY"
5. Requirement: "KILLS"
6. Target: 10
7. Rewards: 100 XP, 50 coins
8. Click "Create"
9. Players see in daily missions list

### Task: Ban suspicious player
1. Go to `/admin/anti-cheat`
2. See suspicious activity
3. Click "Ban User"
4. Player banned immediately

### Task: Create cosmetic for shop
1. Go to `/admin/cosmetics`
2. Click "Create Cosmetic"
3. Name: "Diamond Banner"
4. Type: "Banner"
5. Rarity: "Legendary"
6. Price: 1000 coins
7. Image URL: (link to image)
8. Click "Create"
9. Players can buy immediately

---

## 🖼️ Working with Images

**For URL-based images**:
1. Upload image to external service (imgur, cloudinary, etc.)
2. Copy image URL
3. Paste into admin panel
4. Click preview button to verify
5. Save

**For logo/favicon**:
- Recommended sizes:
  - Logo: 200x100px or larger
  - Favicon: 32x32px or 64x64px
  - Landing banner: 1920x600px or wider

**For cosmetic images**:
- Any size works (system scales)
- PNG with transparency recommended
- Square images best (for frames/badges)
- Rectangular images best (for banners)

---

## 📱 Mobile Admin

The admin panel works on mobile:
- All features available
- Touch-friendly buttons
- Scrollable tables
- Responsive design
- Tab navigation

**Recommended**: Use desktop for best experience with large tables

---

## ⚠️ Important Notes

- **Maintenance Mode**: When ON, only admins can access site
- **Feature Flags**: Disabling features hides from users
- **Coin Amounts**: Large rewards can affect game balance
- **ESR Tiers**: Changing ranges affects player ranks
- **Ban Players**: Cannot undo easily - use caution
- **Mission Creation**: Old missions don't auto-delete
- **Image URLs**: Must be direct image links (not pages)

---

## 🆘 Troubleshooting

**Config changes not showing on landing page?**
- Make sure you clicked "Save [Section]" button
- User might need to refresh browser
- Check browser console for errors

**Can't save user changes?**
- Make sure user exists
- Check if you have admin role
- Try refreshing page

**Mission not showing for players?**
- Make sure "Enable Missions" is ON in Features
- Mission must be in database
- Players need to refresh dashboard

**Admin button not working?**
- Make sure you're logged in as ADMIN
- Check browser console for errors
- Try logging out and back in

---

## 📞 Support

**Need help?**
- Check documentation files in repo
- See API endpoints in registry
- Contact development team
- Check error messages in console

---

## 🎯 Quick Links

| Page | URL | Purpose |
|---|---|---|
| Landing Page | `/` | Public website |
| Admin Dashboard | `/admin` | Main admin hub |
| Site Config | `/admin/config` | Appearance & settings |
| Users | `/admin/users` | User management |
| Missions | `/admin/missions` | Mission creation |
| Achievements | `/admin/achievements` | Achievement creation |
| Badges | `/admin/badges` | Badge creation |
| Cosmetics | `/admin/cosmetics` | Shop items |
| Matches | `/admin/matches` | Match tracking |
| Anti-Cheat | `/admin/anti-cheat` | AC review |
| ESR Tiers | `/admin/esr-tiers` | Rank configuration |

---

**Status**: ✅ Ready to use

*All admin features are live and fully functional. Start managing your platform!*
