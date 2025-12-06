# Feature Guide - Cosmetics & Notifications

## Real-Time Notifications

### For Users
1. Click the **Bell icon** in the header
2. See all unread notifications with timestamps
3. Click the **checkmark button** on a notification to mark as read
4. Click **"Mark all as read"** to clear all at once
5. Badge shows unread count (up to 9+)

### For Admins
Send notifications via API:
```bash
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "match_found",
    "title": "Match Found!",
    "message": "Your match is ready. Join now!",
    "data": {
      "matchId": "match-uuid-here"
    }
  }'
```

## Code-Generated Cosmetics

### Avatar Frames
Generate professional avatar frames on-demand:

```bash
# Legendary frame
/api/cosmetics/generate/frame?rarity=legendary

# Epic frame
/api/cosmetics/generate/frame?rarity=epic

# Rare frame
/api/cosmetics/generate/frame?rarity=rare

# Common frame
/api/cosmetics/generate/frame?rarity=common
```

### Profile Banners
Generate custom profile banners:

```bash
# With title and subtitle
/api/cosmetics/generate/banner?rarity=legendary&title=Pro%20Player&subtitle=2024%20Champion

# Just title
/api/cosmetics/generate/banner?rarity=epic&title=Eclip.pro%20Elite

# Default (uses "Eclip.pro")
/api/cosmetics/generate/banner?rarity=rare
```

### Achievement Badges
Generate star-shaped achievement badges:

```bash
# Legendary badge
/api/cosmetics/generate/badge?rarity=legendary&label=Godlike

# Epic badge
/api/cosmetics/generate/badge?rarity=epic&label=Dominating

# Rare badge
/api/cosmetics/generate/badge?rarity=rare&label=Winning

# Common badge
/api/cosmetics/generate/badge?rarity=common&label=Active
```

## Features Implementation

### How to Use in Code

**Generate frame SVG in JavaScript:**
```typescript
import { generateAvatarFrameSVG } from '@/lib/cosmetic-generator';

const frameSvg = generateAvatarFrameSVG({ 
  type: 'legendary',
  username: 'PlayerName'
});
// Returns data URL: data:image/svg+xml;base64,....
```

**Generate banner SVG:**
```typescript
import { generateBannerSVG } from '@/lib/cosmetic-generator';

const bannerSvg = generateBannerSVG({
  type: 'epic',
  title: 'My Profile',
  subtitle: 'CS2 Champion'
});
```

**Get default banner:**
```typescript
import { getDefaultBannerDataUrl } from '@/lib/cosmetic-generator';

const defaultBanner = getDefaultBannerDataUrl();
// Returns SVG of Eclip.pro banner in Rare colors
```

## Admin Panel Improvements

### New Look & Feel
- Clean monochrome design (no more colorful chaos!)
- Lucide icons throughout
- Semantic color usage only (green = good, red = danger, amber = warning)
- Quick stats dashboard
- Mobile-friendly tables and forms

### Quick Stats
- Total Users count
- Total Matches played
- Total Cosmetics available
- System Health status

### Organized Sections

**Requirement-Based Systems:**
- Missions (16 requirement types)
- Achievements (16 requirement types)
- Badges (6 requirement types)
- ESR Tiers (15 tiers total)

**Core Management:**
- Users (view, edit roles, ban/unban)
- Matches (view, manage results, stats)
- Cosmetics (CRUD operations)
- Anti-Cheat (manage violations)

**Configuration:**
- Site Configuration (logo, banner, maintenance mode, economy)

## Mobile Responsiveness

All components now work on mobile:
- Responsive tables with horizontal scroll
- Stacked forms on small screens
- Touch-friendly buttons and inputs
- Proper spacing and padding
- Readable text at all sizes

## Color System

### Primary Colors (Used Sparingly)
- **Primary:** Accent color for highlights
- **Primary/10:** Light background tint

### Semantic Colors
- **Green (#10B981):** Success, positive actions
- **Red (#EF4444):** Danger, destructive actions
- **Amber (#F59E0B):** Warning, caution

### Rarity Colors (Cosmetics)
- **Common:** Gray (#6B7280)
- **Rare:** Blue (#3B82F6)
- **Epic:** Purple (#8B5CF6)
- **Legendary:** Amber (#FBBF24)

## Icons

All icons are **Lucide React** (monochrome, 1px stroke):
- Bell - Notifications
- MessageSquare - Messages (placeholder)
- Gamepad2 - Play/Matches
- Trophy - Leaderboards/Achievements
- Store - Shop
- CheckCircle - Missions
- Shield - Anti-Cheat
- Users - User Management
- Settings - Configuration
- Gem - Cosmetics
- etc.

## Notifications API

### Fetch Notifications
```bash
GET /api/notifications?limit=5

Response:
{
  "notifications": [
    {
      "id": "uuid",
      "title": "Match Found",
      "message": "Your match is ready",
      "type": "match_found",
      "read": false,
      "createdAt": "2024-12-06T10:00:00Z"
    }
  ],
  "unreadCount": 3
}
```

### Mark as Read
```bash
PUT /api/notifications
{
  "notificationId": "uuid",
  "read": true
}
```

### Mark All as Read
```bash
PUT /api/notifications
{
  "markAllAsRead": true
}
```

### Create Notification
```bash
POST /api/notifications
{
  "type": "match_found",
  "title": "New Notification",
  "message": "This is a message",
  "data": { "any": "json data" }
}
```

## Dashboard & Profile

### Dashboard Banner
- Shows **equipped banner** if user has one
- Falls back to **primary green color**
- Overlay ensures text readability
- Responsive on all devices

### Profile Banner
- Shows **equipped banner** if user has one
- Falls back to **code-generated Rare banner** (blue)
- Includes user title, role badge, rank, ESR
- Clean, professional appearance

### Cosmetics Integration
Users can equip cosmetics in `/shop`:
1. Browse Frames, Banners, Badges, Titles
2. Purchase with coins (if not owned)
3. Click "Equip" to use
4. Changes appear on dashboard and profile
5. Manage in Settings > Account > Customize Profile

## API Endpoint Registry

Check all available endpoints:
```typescript
import { API_ENDPOINTS } from '@/lib/api-registry';

// View all endpoints
Object.entries(API_ENDPOINTS).forEach(([endpoint, config]) => {
  console.log(`${config.method} ${endpoint} - ${config.description}`);
});

// Result:
// POST /api/auth/login - Login with email/password
// POST /api/auth/register - Register new account
// GET /api/auth/me - Get current user profile
// ... and 50+ more
```

## Messages Placeholder

Messages feature is currently marked for future implementation:
- Icon is disabled (opacity 50%)
- Shows "Messages coming soon" tooltip
- Button is not clickable
- UI ready for implementation when backend is ready

---

**All features are production-ready and fully tested.** ✅
