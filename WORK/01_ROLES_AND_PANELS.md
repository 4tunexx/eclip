# Roles & Panels – ADMIN / MODERATOR / INSIDER / VIP / USER

This document defines the **roles, permissions, colors, and panels** for Eclip.pro.

## 1. Roles

There are 5 roles (4 visible, 1 implicit):

- `USER` (default, white)
- `VIP` (purple)
- `INSIDER` (orange)
- `MODERATOR` (green)
- `ADMIN` (red)

### 1.1 Role Colors

| Role       | Color Hex | Use Cases                                        |
|------------|-----------|--------------------------------------------------|
| ADMIN      | #FF3B30   | Names, badges, admin tags, admin-only UI        |
| MODERATOR  | #34C759   | Names, badges, mod tags, moderation UI          |
| INSIDER    | #FF9500   | Names, badges, insider markers, beta features   |
| VIP        | #AF52DE   | Names, badges, VIP shop markers, queue perks    |
| USER       | #FFFFFF   | Default usernames, basic UI                     |

### 1.2 Priority

If a user has multiple flags (e.g. VIP + Insider), represent only **one main role** visually in this order:

`ADMIN > MODERATOR > INSIDER > VIP > USER`

---

## 2. Permissions Matrix

| Capability                           | ADMIN | MOD | INSIDER | VIP | USER |
|--------------------------------------|:-----:|:---:|:-------:|:---:|:----:|
| Access Admin Panel                   |  ✅   | ❌  |   ❌    | ❌  |  ❌  |
| Access Moderator Panel               |  ✅   | ✅  |   ❌    | ❌  |  ❌  |
| Access Insider Panel                 |  ✅   | ✅  |   ✅    | ❌  |  ❌  |
| Access VIP Panel (user view)         |  ✅   | ✅  |   ✅    | ✅  |  ❌  |
| Edit site settings                   |  ✅   | ❌  |   ❌    | ❌  |  ❌  |
| Edit landing page content            |  ✅   | ❌  |   ❌    | ❌  |  ❌  |
| Create / edit missions               |  ✅   | ❌  |   ❌    | ❌  |  ❌  |
| Create / edit achievements           |  ✅   | ❌  |   ❌    | ❌  |  ❌  |
| Create / edit badges & cosmetics     |  ✅   | ❌  |   ❌    | ❌  |  ❌  |
| Force ESR adjustment                 |  ✅   | ❌  |   ❌    | ❌  |  ❌  |
| Ban users                            |  ✅   | ✅* |   ❌    | ❌  |  ❌  |
| Temporary mute users (chat/forum)    |  ✅   | ✅  |   ❌    | ❌  |  ❌  |
| View anti-cheat events               |  ✅   | ✅  |   ❌    | ❌  |  ❌  |
| Review AC flags & apply bans         |  ✅   | ✅  |   ❌    | ❌  |  ❌  |
| Manage VIP & Insider assignments     |  ✅   | ❌  |   ❌    | ❌  |  ❌  |
| Access Insider-only testing features |  ✅   | ✅  |   ✅    | ❌  |  ❌  |
| Access VIP-only cosmetics            |  ✅   | ✅  |   ✅    | ✅  |  ❌  |

`*` Moderators can only ban for clear reasons, cannot ban ADMIN or MOD accounts.

---

## 3. Panels Overview

### 3.1 Admin Panel

Path: `/admin`

Visible to roles: `ADMIN`

Sections:

1. **Dashboard**
2. **Users**
3. **Missions**
4. **Achievements**
5. **Cosmetics (badges, banners, frames, titles)**
6. **Ranks & ESR Settings**
7. **Matches**
8. **Anti-Cheat**
9. **Forum & Community**
10. **Support**
11. **Site Settings**
12. **VIP & Insider Control**

(See `05_ADMIN_PANEL_SPEC.md` for detailed fields and actions.)

### 3.2 Moderator Panel

Path: `/mod`

Visible to: `MODERATOR`, `ADMIN`

- Reports queue
- Chat & forum moderation tools
- Quick user lookup
- Limited AC view

### 3.3 Insider Panel

Path: `/insider`

Visible to: `INSIDER`, `MODERATOR`, `ADMIN`

- Upcoming features list (read-only)
- Patch notes
- Feedback form

### 3.4 VIP Panel

Path: `/vip`

Visible to: `VIP`, `INSIDER`, `MODERATOR`, `ADMIN`

- VIP status card
- VIP perks description
- VIP shop preview
- Link to VIP-filtered cosmetics

---

END OF FILE
