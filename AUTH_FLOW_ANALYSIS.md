# Authentication Flow Analysis & Issues

## Executive Summary

The authentication system has **critical missing features** for the dual-auth requirement (Email + Steam). Currently, the system:
- ✅ Allows email registration with email verification
- ✅ Allows Steam login/registration  
- ❌ Does NOT enforce dual authentication (email + Steam must both be verified)
- ❌ Does NOT notify users when they need to link their account
- ❌ Does NOT display Steam verification status in UI
- ❌ Does NOT prevent incomplete authentication flows

---

## Current Flow Analysis

### 1. EMAIL REGISTRATION FLOW ✅
**Path**: `POST /api/auth/register` → Email verification

```
User submits email/password
    ↓
Validation checks (email unique, password 8+ chars)
    ↓
User created with: emailVerified: false, steamId: "temp-{UUID}"
    ↓
Verification email sent (sendVerificationEmail)
    ↓
User clicks email link: /api/auth/verify-email?token={token}
    ↓
emailVerified: true, emailVerificationToken: null
    ↓
User can login with email/password
```

**Status**: ✅ Working correctly

---

### 2. STEAM LOGIN/REGISTRATION FLOW ✅
**Path**: `/api/auth/steam` → Steam OpenID → `/api/auth/steam/return`

```
User clicks "Sign in/up with Steam"
    ↓
Redirect to Steam OpenID (steamcommunity.com/openid/login)
    ↓
Steam redirects back to /api/auth/steam/return with openid.* params
    ↓
Verify Steam signature
    ↓
Extract Steam ID from openid.claimed_id
    ↓
Check if user exists with steamId
    ↓
If NOT exists: Create new user with:
  - email: "{steamId}@steam.local"
  - username: "steam_{steamId.slice(-6)}"
  - passwordHash: null
  - steamId: (from Steam)
  - emailVerified: true ← ⚠️ PROBLEM!
    ↓
Fetch Steam avatar from Steam API
    ↓
Create session + set cookie
    ↓
Redirect to /dashboard
```

**Status**: ✅ Working, but ⚠️ **emailVerified is set to TRUE immediately**

---

## Critical Issues Found

### ⚠️ ISSUE #1: No Dual Authentication Enforcement
**Problem**: 
- Email registration does NOT require Steam linking
- Steam registration does NOT require email verification
- System sets `emailVerified: true` for Steam-only users

**Expected Behavior** (based on requirements):
- Email register → user gets "Link your Steam account" notification
- Steam register → user gets "Verify your email" notification
- User CANNOT login until BOTH are verified

**Current Result**:
- Email users can login without Steam
- Steam users can login without email

---

### ⚠️ ISSUE #2: No Account Linking Notifications
**Problem**: 
- No mechanism to track whether user needs to complete auth
- No UI to show "pending Steam link" or "pending email verification" status
- No database field to track auth completion status

**Missing**:
```typescript
// Schema needs:
steamIdVerified?: boolean (or verified_at timestamp)
accountLinkingRequired?: boolean
pendingAuthMethods?: string[] // ['steam', 'email']
```

---

### ⚠️ ISSUE #3: No Steam Status Badge/Icon in UI
**Problem**: 
- No way to display Steam verification status
- No "Steam" icon next to username in collapsible nav
- `steamId` field not returned in `/api/auth/me` endpoint

**Missing from `/api/auth/me`**:
```typescript
steamId: (user as any).steamId, // ← NOT INCLUDED
steamIdVerified: Boolean((user as any).steamIdVerified), // ← NOT IN SCHEMA
authMethods: ['email', 'steam'] // ← NOT TRACKED
```

---

### ⚠️ ISSUE #4: No In-App Linking/Notification UI
**Problem**:
- No notification system for pending authentications
- No modal/component to link Steam or verify email from dashboard
- Users don't know they're missing an auth method

---

### ⚠️ ISSUE #5: Email Verification Email Not Sent on Steam Register
**Problem**:
- When registering via Steam, `emailVerified: true` is hardcoded
- User with steam-generated email never receives verification
- If user tries to use that email later, issues arise

---

### ⚠️ ISSUE #6: Steam Avatar Not Properly Used
**Problem**:
- Steam avatar is fetched and stored in `avatar` field
- But system might use this for both email and Steam users
- No distinction between user-provided vs Steam-provided avatar

---

## What Needs to Happen

### Option A: True Dual-Auth (Strict)
```
Email Register:
  1. User creates account with email/password
  2. Email verification required (emailVerified: false)
  3. Show: "Verify your email" + "Link your Steam account" prompts
  4. Upon Steam link: fetch Steam ID, store it, set steamVerified: true
  5. Upon email verify: set emailVerified: true
  6. Only allow login when BOTH are true

Steam Register:
  1. User authenticates with Steam
  2. Create account with steamId
  3. Show: "Complete setup" with "Enter your email" form
  4. Upon email submission: send verification email
  5. Upon email verify: set emailVerified: true
  6. Only allow login when BOTH are true
```

### Option B: Flexible Auth (Current State)
```
Allow login with either:
  - Email + Password (if email verified)
  - Steam (if steamId exists)
But track what the user has verified
```

---

## Schema Changes Needed

```typescript
export const users = pgTable('users', {
  // ... existing fields ...
  
  // Current (problematic):
  steamId: text('steam_id').notNull(), // Forces even email-only users
  emailVerified: boolean('email_verified').default(false),
  
  // Should be:
  steamId: text('steam_id').unique(), // Nullable, optional
  steamIdVerified: boolean('steam_id_verified').default(false),
  steamVerifiedAt: timestamp('steam_verified_at'),
  
  emailVerified: boolean('email_verified').default(false),
  emailVerifiedAt: timestamp('email_verified_at'),
  
  // Track auth status:
  authStatus: text('auth_status').default('INCOMPLETE'), // INCOMPLETE, EMAIL_ONLY, STEAM_ONLY, DUAL_AUTH
  
  // Email can now be optional for Steam-only users:
  email: text('email').unique(), // Remove .notNull() constraint
});
```

---

## API Endpoints That Need Fixing

### 1. `/api/auth/register` - Email Registration
**Current**: Sets `steamId: "temp-{UUID}"`, doesn't require Steam
**Fix**: 
- Make steamId truly optional (nullable)
- Don't create fake steamId
- Set emailVerified: false
- Send email verification
- Mark status as INCOMPLETE

### 2. `/api/auth/steam/return` - Steam Auth
**Current**: Sets `emailVerified: true` immediately
**Fix**:
- Generate random email or let user choose
- Set emailVerified: false (require confirmation)
- Send verification email to provided email
- Set status to INCOMPLETE until both verified

### 3. `/api/auth/me` - User Info
**Current**: Doesn't return Steam/Email status
**Fix**: Add:
```typescript
{
  ...existing,
  steamId: (user as any).steamId || null,
  steamIdVerified: Boolean((user as any).steamIdVerified),
  emailVerified: Boolean((user as any).emailVerified),
  authMethods: ['email', 'steam'], // which ones are verified
  authStatus: (user as any).authStatus, // INCOMPLETE, EMAIL_ONLY, etc
}
```

### 4. `/api/auth/login` - Email Login
**Current**: Allows login if emailVerified is true
**Fix**: Optionally allow login with single verified method
OR require both verified

### 5. NEW: `/api/auth/link-steam` - Link Steam Account
**What it should do**:
- Take authenticated email user
- Redirect to Steam OAuth
- On return, attach steamId to existing user
- Set steamIdVerified: true

### 6. NEW: `/api/auth/verify-email-for-steam` - Verify Email After Steam
**What it should do**:
- For Steam users who need to verify email
- Send verification email
- Handle verification token

---

## UI Components That Need Adding

### 1. Auth Status Badge/Component
Show next to username:
```tsx
<UserName username={user.username} />
{/* Show these icons */}
<EmailVerifiedIcon /> {/* Green checkmark */}
<SteamVerifiedIcon /> {/* Green Steam logo */}
{/* If incomplete: */}
<AlertIcon /> {/* Yellow warning */}
```

### 2. Account Linking Modal
**Trigger**: On dashboard load if auth is INCOMPLETE
```tsx
<AccountLinkingModal
  requiredMethods={['steam']} // What's missing
  onSteamLinked={refetch}
/>
```

### 3. Mini Profile Card Enhancements
In collapsible nav, show:
```
┌─────────────────┐
│ [Avatar] Name   │
│ Status: Complete│
│ ☑ Email ☑ Steam│
└─────────────────┘
```

---

## Security Considerations

⚠️ **Important**: 
- Email-only users MUST have real password protection (already done)
- Steam-only users have NO password (is this intentional?)
- If Steam user wants to set password, provide that option
- Rate limit email verification requests
- Rate limit Steam linking attempts

---

## Testing Checklist

- [ ] Register with email → receive verification email → verify → check DB
- [ ] Register with Steam → get notification to verify email → verify → check DB
- [ ] Email user tries to link Steam → redirect → link → check DB
- [ ] Steam user tries to add email → form → verification → check DB
- [ ] Login with email only (should work today, maybe restricted later)
- [ ] Login with Steam only (should work)
- [ ] Check `/api/auth/me` returns correct status
- [ ] Check UI shows correct icons/badges
- [ ] Test logout works (already fixed cookie issue)
- [ ] Test token expiration scenarios

---

## Files That Need Modification

### Priority 1 (Critical):
1. `src/lib/db/schema.ts` - Add verification fields
2. `src/app/api/auth/register/route.ts` - Fix email registration
3. `src/app/api/auth/steam/return/route.ts` - Fix Steam auth flow
4. `src/app/api/auth/me/route.ts` - Return auth status
5. `src/app/api/auth/login/route.ts` - Enforce dual-auth if needed

### Priority 2 (Important):
6. Create `src/app/api/auth/link-steam/route.ts` - New endpoint
7. Create `src/components/auth/AccountLinkingModal.tsx` - New UI
8. Update `src/components/layout/collapsible-header.tsx` - Show status
9. Create Steam status icon component

### Priority 3 (Polish):
10. Notification system for auth completion
11. Better error messages for incomplete auth
12. Documentation for users

---

## Recommendation

**Implement Option A (True Dual-Auth)** because:
1. Matches your stated requirement: "user needs to have both steam and email authorised"
2. More secure - two factors prevent account takeover
3. Better UX - users understand both are required upfront
4. Matches modern security standards

**Estimated effort**: 4-6 hours for full implementation + testing

