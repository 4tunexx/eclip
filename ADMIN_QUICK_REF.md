# QUICK REFERENCE - ADMIN ROLE MANAGEMENT

## 🚀 Quick Start

### 1. Check System Status
```bash
node check-system-status.js
```
Shows all tables, env vars, and system status

### 2. Assign Role to User (API)
```bash
curl -X PATCH http://localhost:9002/api/admin/users/{userId} \
  -H "Content-Type: application/json" \
  -d '{"role": "VIP"}'
```

### 3. Update Multiple User Stats
```bash
curl -X PATCH http://localhost:9002/api/admin/users/{userId} \
  -H "Content-Type: application/json" \
  -d '{
    "role": "MODERATOR",
    "coins": 5000,
    "xp": 10000,
    "level": 15,
    "esr": 1800
  }'
```

## 📋 Role Colors (Fixed)

| Role | Color | Code |
|------|-------|------|
| 👤 USER | Gray | #808080 |
| 👑 VIP | Gold | #FFD700 |
| 🔍 INSIDER | Sky Blue | #87CEEB |
| 🛡️ MODERATOR | Dark Orange | #FF8C00 |
| ⚙️ ADMIN | Deep Pink | #FF1493 |

## 🎯 What Happens When Admin Sets Role

✅ Role assigned
✅ Color automatically applied
✅ Nickname updated
✅ Badge added (if applicable)
✅ Database updated
✅ Logged for audit
✅ User sees changes on next login

## 📊 Automatic Features by Role

### USER
- Standard gray username
- No badge
- Standard permissions

### VIP
- Gold (#FFD700) username
- 👑 Crown badge
- VIP perks (XP+20%, ESR+10%, queue priority)

### INSIDER
- Sky blue (#87CEEB) username
- 🔍 Search badge
- Early access to features
- Community insights

### MODERATOR
- Orange (#FF8C00) username
- 🛡️ Shield badge
- Moderation powers
- Community management

### ADMIN
- Deep pink (#FF1493) username
- ⚙️ Gear badge
- Full system access
- User management

## 🗄️ Database Tables (40 total)

**Critical Tables Present:**
- users ✅
- sessions ✅
- matches ✅
- match_players ✅
- cosmetics ✅
- user_profiles ✅
- role_permissions ✅
- vip_subscriptions ✅
- esr_thresholds ✅
- achievements ✅
- missions ✅
- notifications ✅
- + 28 more support tables

## 🔑 Environment Variables Loaded

```
DATABASE_URL     ✅ PostgreSQL (Neon)
NODE_ENV         ✅ Production
JWT_SECRET       ✅ Auth token signing
SESSION_SECRET   ✅ Session management
CLOUDINARY_*     ✅ Image storage
SENDGRID_*       ✅ Email service
STEAM_API_KEY    ✅ Steam auth
API_BASE_URL     ✅ API endpoint
REDIS_URL        ✅ Caching
WS_URL           ✅ WebSockets
```

## 💾 API Endpoints

### Get All Users
```
GET /api/admin/users
Authorization: Admin role required
```

### Get User Details
```
GET /api/admin/users/{userId}
Authorization: Admin role required
```

### Update User (Role, Stats, Coins)
```
PATCH /api/admin/users/{userId}
Authorization: Admin role required

Body: {
  role?: "USER" | "VIP" | "INSIDER" | "MODERATOR" | "ADMIN",
  coins?: number,
  xp?: number,
  level?: number,
  esr?: number,
  rank?: string
}
```

## 🎨 Role Manager Component

```tsx
import { AdminRoleManager } from '@/components/admin-role-manager';

<AdminRoleManager 
  user={userData}
  onRoleChange={(updated) => console.log(updated)}
/>
```

## 📝 Role Configuration

Located in: `/src/lib/role-config.ts`

```typescript
getRoleConfig(role)      // Get full config
getRoleColor(role)       // Get hex color
getRoleNickname(role)    // Get display name
hasRoleBadge(role)       // Check badge
getRolePriority(role)    // Get priority level
getAllRoles()            // Get all roles
getAssignableRoles()     // Get assignable roles
```

## 🔐 Security Features

✅ Admin authentication required
✅ Role validation
✅ Input sanitization (Zod)
✅ Audit logging
✅ Transaction tracking
✅ Transactional DB operations

## 📈 User Data You Can Update

```json
{
  "role": "VIP",           // User role
  "coins": 1000,           // Coin balance
  "xp": 5000,              // Experience points
  "level": 10,             // User level
  "esr": 1500,             // Eclip Skill Rating
  "rank": "Pro"            // Rank name
}
```

## 🐛 Troubleshooting

**Role not visible?**
- Check if user is logged in
- Role takes effect on next login
- Clear browser cache

**Color not showing?**
- Verify role_color column in users table
- Check roleColor is populated
- Refresh user profile

**Admin can't assign roles?**
- Verify admin user role in database
- Check `isUserAdmin()` function
- Verify JWT token is valid

## 📞 Support

See ADMIN_ROLE_MANAGEMENT.md for detailed documentation
