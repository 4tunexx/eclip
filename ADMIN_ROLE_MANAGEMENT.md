# ADMIN ROLE MANAGEMENT SYSTEM

## Overview

The admin system now includes comprehensive role management capabilities that allow administrators to assign roles to users with automatic color and extra feature application.

## Environment Variables Loaded

### Database
- `DATABASE_URL` - PostgreSQL connection string (Neon)
- `NODE_ENV` - Environment mode (production)

### Authentication
- `JWT_SECRET` - JWT token signing key
- `SESSION_SECRET` - Session cookie secret

### Storage & Media
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

### Email
- `SENDGRID_API_KEY` - SendGrid email API key
- `SENDGRID_FROM` - Email sender address
- `SENDGRID_FROM_NAME` - Email sender display name
- `EMAIL_FROM` - Default email sender
- `EMAIL_SERVER` - SMTP server configuration
- `EMAIL_VERIFY_URL` - Email verification URL

### Gaming & Integration
- `STEAM_API_KEY` - Steam authentication API key
- `STEAM_REALM` - Steam authentication realm
- `STEAM_RETURN_URL` - Steam callback URL

### Server
- `API_BASE_URL` - API base URL
- `MATCH_SERVER_PORT` - Game server port
- `REDIS_URL` - Redis connection string
- `WS_URL` - WebSocket server URL

## Database Tables Status

### Core Tables (40 total)
✅ users
✅ sessions
✅ matches
✅ match_players
✅ cosmetics
✅ user_profiles
✅ role_permissions
✅ vip_subscriptions
✅ user_cosmetics
✅ leaderboards
✅ esr_thresholds
✅ achievements
✅ user_achievements
✅ missions
✅ user_mission_progress
✅ notifications
... and 23 more support tables

## Role Configuration

### Available Roles

```
USER (Standard User)
├─ Color: #808080 (Gray)
├─ Nickname: User
├─ Priority: 1
└─ Badge: None

VIP (VIP Subscriber)
├─ Color: #FFD700 (Gold)
├─ Nickname: VIP
├─ Priority: 3
├─ Badge: Yes (👑)
└─ Description: VIP Subscriber with premium features

INSIDER (Community Insider)
├─ Color: #87CEEB (Sky Blue)
├─ Nickname: Insider
├─ Priority: 4
├─ Badge: Yes (🔍)
└─ Description: Community Insider with early access

MODERATOR (Community Moderator)
├─ Color: #FF8C00 (Dark Orange)
├─ Nickname: Moderator
├─ Priority: 5
├─ Badge: Yes (🛡️)
└─ Description: Community Moderator with moderation powers

ADMIN (Administrator)
├─ Color: #FF1493 (Deep Pink)
├─ Nickname: Admin
├─ Priority: 10
├─ Badge: Yes (⚙️)
└─ Description: System Administrator
```

## Admin Role Management API

### Endpoint: PATCH /api/admin/users/{userId}

**Authentication**: Admin role required

**Request Body**:
```json
{
  "role": "VIP",
  "coins": 1000,
  "xp": 5000,
  "level": 10,
  "esr": 1500,
  "rank": "Pro"
}
```

**Response on Success**:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "player",
    "email": "player@example.com",
    "role": "VIP",
    "roleColor": "#FFD700",
    "level": 10,
    "xp": 5000,
    "esr": 1500,
    "coins": "1000.00"
  },
  "roleConfig": {
    "color": "#FFD700",
    "nickname": "VIP",
    "description": "VIP Subscriber",
    "icon": "👑",
    "badge": true,
    "priority": 3
  }
}
```

### Automatic Features on Role Assignment

When an admin assigns a role to a user:

1. **Role Color** - Automatically applied based on role
2. **Nickname** - User display name reflects role
3. **Badge** - Badge indicator added if role has one
4. **Priority** - Role priority used for queue ordering
5. **Permissions** - Role permissions applied from `role_permissions` table

## Implementation Files

### Backend
- `/src/app/api/admin/users/[id]/route.ts` - Enhanced with role management
- `/src/lib/role-config.ts` - Centralized role configuration

### Frontend
- `/src/components/admin-role-manager.tsx` - Admin role assignment UI component

### Utilities
- `/src/lib/role-config.ts` - Role configuration utilities
  - `getRoleConfig(role)` - Get full role configuration
  - `getRoleColor(role)` - Get role color
  - `getRoleNickname(role)` - Get role nickname
  - `hasRoleBadge(role)` - Check if role has badge
  - `getAssignableRoles()` - Get roles that can be assigned

## Using the Admin Role Manager

### Via API (Direct)

```bash
# Assign VIP role to user
curl -X PATCH http://localhost:9002/api/admin/users/{userId} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {adminToken}" \
  -d '{"role": "VIP"}'
```

### Via Component (React)

```tsx
import { AdminRoleManager } from '@/components/admin-role-manager';

export function UserManagementPage({ user }) {
  return (
    <AdminRoleManager 
      user={user} 
      onRoleChange={(updatedUser) => {
        console.log('Role updated:', updatedUser.role);
      }}
    />
  );
}
```

## Role Colors Reference

| Role | Color Code | Hex | Example |
|------|-----------|-----|---------|
| USER | Gray | #808080 | 👤 User |
| VIP | Gold | #FFD700 | 👑 VIP |
| INSIDER | Sky Blue | #87CEEB | 🔍 Insider |
| MODERATOR | Dark Orange | #FF8C00 | 🛡️ Moderator |
| ADMIN | Deep Pink | #FF1493 | ⚙️ Admin |

## Database Check Script

Run the system status check:

```bash
node check-system-status.js
```

This will display:
- All environment variables status
- All database tables
- Critical tables verification
- User role distribution
- VIP system status
- Cosmetics inventory
- Achievements data
- Missions data

## Features

### For Admins
✅ Assign roles to users via API or UI
✅ View all users with current role
✅ Automatically apply role colors
✅ Track role changes with logging
✅ Update user stats (coins, xp, level, esr)
✅ Transaction logging for coin changes

### For Users with Roles
✅ Display role color in username
✅ Show role badge in profile
✅ Role-based permissions applied
✅ Role icon and description visible
✅ Queue priority based on role

## Role Priorities

Lower numbers = lower priority, higher numbers = higher priority

1. USER (1) - Standard user
2. VIP (3) - VIP subscriber
3. INSIDER (4) - Community insider
4. MODERATOR (5) - Community moderator
5. ADMIN (10) - System administrator

## Security

✅ Admin authentication required for all role operations
✅ Role validation on assignment
✅ Audit logging of all role changes
✅ Transactional database operations
✅ Zod schema validation on input

## Notes

- Users receive their new role on next login
- Role colors are automatically synchronized
- Role changes are immediately persisted to database
- All admin actions are logged for audit trail
- VIP role integrates with VIP subscription system
