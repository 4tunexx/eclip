# Auth System - Quick Summary & Critical Issues

## 🔴 Critical Issues Found

### Issue 1: No Dual-Auth Enforcement
- ❌ Email users can login WITHOUT Steam verification  
- ❌ Steam users can login WITHOUT email verification
- ❌ System designed for single auth, not dual

### Issue 2: No Account Status Tracking
- ❌ No field to track if user needs to complete auth
- ❌ No way to know if user is EMAIL_ONLY, STEAM_ONLY, or DUAL_AUTH
- ❌ No database fields: steamIdVerified, emailVerifiedAt, etc.

### Issue 3: No Notification System
- ❌ Steam user doesn't get prompted to verify email
- ❌ Email user doesn't get prompted to link Steam
- ❌ No modal/UI to guide incomplete auth flows

### Issue 4: No UI Status Indicators
- ❌ No Steam icon badge next to username  
- ❌ No indication if account is fully verified
- ❌ `/api/auth/me` doesn't return steamId or verification status

### Issue 5: Broken Schema Design
- ❌ `steamId` is NOT NULL but email-only users get fake value
- ❌ Creates orphaned data and potential conflicts
- ❌ Should be: `steamId` nullable, only populated after Steam auth

### Issue 6: Steam Auth Issues
- ❌ When user registers via Steam, `emailVerified: true` hardcoded
- ❌ No email verification token sent
- ❌ No way to update email after Steam registration
- ❌ Email address is fake: `"{steamId}@steam.local"`

---

## ✅ What IS Working

| Feature | Status | Notes |
|---------|--------|-------|
| Email registration | ✅ | Creates user, sends verification email |
| Email verification | ✅ | Token-based, updates emailVerified flag |
| Email login | ✅ | Requires emailVerified=true |
| Steam login/register | ✅ | OAuth flow works correctly |
| Session management | ✅ | JWT tokens, cookies work |
| Logout | ✅ | (Fixed cookie domain issue) |

---

## 🔧 What Needs Fixing

### Database
```
ADD steam_id_verified BOOLEAN
ADD steam_verified_at TIMESTAMP
ADD email_verified_at TIMESTAMP
ADD auth_status TEXT (INCOMPLETE, EMAIL_ONLY, STEAM_ONLY, DUAL_AUTH)
CHANGE steam_id from NOT NULL to NULLABLE
CHANGE email from NOT NULL to NULLABLE
```

### API Endpoints
```
POST /api/auth/register → Don't set fake steamId
POST /api/auth/steam/return → Don't set emailVerified=true automatically
GET /api/auth/me → Return steamId, steamIdVerified, authStatus
POST /api/auth/link-steam → NEW - for email users to link Steam
POST /api/auth/update-email-for-steam → NEW - for Steam users to add email
```

### UI Components
```
NEW: AuthStatusBadge component (shows email/Steam icons)
NEW: AccountLinkingModal component (prompts for missing auth)
UPDATE: CollapsibleHeader (show status badges)
UPDATE: UserContext (include new fields)
```

---

## 📋 Current Auth Flows

### Email Register
```
Email + Password → Validation → Create User (emailVerified=false)
  → Send Email → Click Link → Set emailVerified=true → Can Login ✅
```

### Steam Register  
```
Click Steam → Steam OAuth → Extract steamId → Create User
  → Set steamIdVerified=true ✅
  → Set emailVerified=true ❌ (WRONG - should be false)
  → User can login without email verification ❌
```

### Email Login
```
Email + Password → Hash check → emailVerified? → YES → Create session ✅
```

### Steam Login
```
Steam OAuth → steamId exists? → YES → Create session ✅
```

---

## 📊 Data Issues

### Current Schema
```typescript
users {
  steamId: text NOT NULL, // PROBLEM: Forces value even for email users
  email: text UNIQUE,     // Can be null? Not stated
  emailVerified: boolean,
  // Missing:
  // - steamIdVerified
  // - authStatus
  // - timestamps
}
```

### What Users Currently Have

**Email-Only User (Bad)**
```json
{
  "steamId": "temp-12345",  // FAKE value
  "email": "user@gmail.com",
  "emailVerified": true,
  "authStatus": undefined   // Not tracked!
}
```

**Steam-Only User (Bad)**
```json
{
  "steamId": "76561198...",
  "email": "12345@steam.local",  // FAKE
  "emailVerified": true,         // WRONG!
  "authStatus": undefined        // Not tracked!
}
```

### What They SHOULD Have

**Email-Only User (Correct)**
```json
{
  "steamId": null,
  "steamIdVerified": false,
  "email": "user@gmail.com",
  "emailVerified": true,
  "emailVerifiedAt": "2024-12-09T10:00:00Z",
  "authStatus": "EMAIL_ONLY"
}
```

**Steam + Email User (Correct)**
```json
{
  "steamId": "76561198...",
  "steamIdVerified": true,
  "steamVerifiedAt": "2024-12-09T09:00:00Z",
  "email": "user@gmail.com",
  "emailVerified": true,
  "emailVerifiedAt": "2024-12-09T10:00:00Z",
  "authStatus": "DUAL_AUTH"
}
```

---

## 🎯 Required Behavior (Your Requirements)

> "user register with email default then he will get notification to authorise steam account and once done he will have small steam valve icon next to his name on colapsable nav bar where is mini profile card"

**Broken down:**
1. ✅ User registers with email
2. ❌ Gets notification to link Steam → **MISSING**
3. ❌ User links Steam → **PARTIALLY WORKS**
4. ❌ Shows Steam icon in nav → **MISSING**

> "if user register with steam via register form then he will get notification to auth email like enter email and he gets confirmation needs to be pressed via his email check env so basically user needs to have both steam and email authorised"

**Broken down:**
1. ✅ User registers with Steam
2. ❌ Gets notification for email → **MISSING**
3. ❌ Sends verification email → **MISSING**
4. ❌ User verifies email → **PARTIALLY WORKS**
5. ❌ Both required for full access → **NOT ENFORCED**

---

## 🚀 Quick Implementation Checklist

### Phase 1: Database (30 min)
- [ ] Create migration SQL file
- [ ] Add missing columns/fields
- [ ] Make steamId nullable
- [ ] Add unique constraint

### Phase 2: Backend (2 hours)
- [ ] Update schema.ts with new fields
- [ ] Fix `/api/auth/register` (remove fake steamId)
- [ ] Fix `/api/auth/steam/return` (proper email handling)
- [ ] Update `/api/auth/me` (return auth status)
- [ ] Create `/api/auth/link-steam` endpoint
- [ ] Create `/api/auth/update-email-for-steam` endpoint

### Phase 3: Frontend (1.5 hours)
- [ ] Update UserContext with new fields
- [ ] Create AuthStatusBadge component
- [ ] Create AccountLinkingModal component
- [ ] Update CollapsibleHeader with badge
- [ ] Add modal to Dashboard

### Phase 4: Testing (1 hour)
- [ ] Test all 6 scenarios
- [ ] Check database values
- [ ] Verify UI displays correctly
- [ ] Test edge cases

---

## 🔗 Related Issues

- Logout now works (fixed cookie domain issue in previous fix)
- Session management is solid
- JWT/token handling is correct
- Email sending works (verification emails sent)
- Steam OAuth integration works

---

## 📌 Files to Modify

**Critical:**
- `src/lib/db/schema.ts` - Add fields
- `src/app/api/auth/register/route.ts` - Remove fake steamId
- `src/app/api/auth/steam/return/route.ts` - Proper email handling
- `src/app/api/auth/me/route.ts` - Return status
- `src/contexts/UserContext.tsx` - New fields

**New Files:**
- `src/app/api/auth/link-steam/route.ts` - New endpoint
- `src/components/auth/AuthStatusBadge.tsx` - New component
- `src/components/auth/AccountLinkingModal.tsx` - New component

**Updates:**
- `src/components/layout/collapsible-header.tsx` - Show badges
- `src/app/(app)/dashboard/page.tsx` - Show modal

---

## 🎓 Key Insights

The system was **partially built** for dual-auth but:
1. Missing database tracking (no auth status)
2. Missing UI indicators (no badges)
3. Missing linking flows (can't link after registration)
4. Steam user gets auto-verified for email (wrong)
5. No prompts to complete setup

It's ~80% done but the last 20% (notifications & UI) is missing.

