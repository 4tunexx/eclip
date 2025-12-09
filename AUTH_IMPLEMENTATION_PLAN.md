# Authentication System Implementation Plan

## Phase 1: Database Schema Update

### Step 1.1: Create Migration for Schema Changes

**New fields to add to `users` table:**

```sql
-- Add new verification fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS steam_id_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS steam_verified_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_status TEXT DEFAULT 'INCOMPLETE';

-- Make steamId truly optional (remove NOT NULL)
ALTER TABLE users ALTER COLUMN steam_id DROP NOT NULL;

-- Make email optional for Steam-only users
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Add unique constraints
ALTER TABLE users ADD CONSTRAINT unique_steam_id_when_not_null UNIQUE (steam_id) WHERE steam_id IS NOT NULL;
```

### Step 1.2: Update Drizzle Schema

**File**: `src/lib/db/schema.ts`

```typescript
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Email fields
  email: text('email').unique(), // ← Remove .notNull()
  emailVerified: boolean('email_verified').default(false),
  emailVerificationToken: text('email_verification_token'),
  emailVerifiedAt: timestamp('email_verified_at'),
  
  // Steam fields
  steamId: text('steam_id').unique(), // ← Remove .notNull()
  steamIdVerified: boolean('steam_id_verified').default(false),
  steamVerifiedAt: timestamp('steam_verified_at'),
  
  // Auth status tracking
  authStatus: text('auth_status').default('INCOMPLETE'), 
  // Values: INCOMPLETE, EMAIL_ONLY, STEAM_ONLY, DUAL_AUTH
  
  // ... rest of existing fields ...
});
```

---

## Phase 2: Backend API Updates

### Step 2.1: Update `/api/auth/register` (Email Registration)

**What changes**:
- Remove fake steamId generation
- Set steamId to NULL
- Set emailVerified: false
- Set authStatus: 'INCOMPLETE'
- Send verification email (already done)

### Step 2.2: Update `/api/auth/steam/return` (Steam Auth)

**What changes**:
1. Generate proper email for Steam user (options):
   - Ask user to provide email (new modal)
   - Use Steam email if available from profile
   - Generate placeholder: `steam+{steamId}@temp.local`

2. Set these fields correctly:
   - steamId: (from Steam)
   - steamIdVerified: true (they authenticated with Steam)
   - email: (get from user/generate)
   - emailVerified: false (need to verify)
   - authStatus: 'STEAM_ONLY'

3. Send verification email to the email address

### Step 2.3: Update `/api/auth/login` 

**Current logic** (no change needed if allowing flexible auth):
```typescript
if (!user || !user.passwordHash) {
  // Error: user not found or no password set
}

if (!user.emailVerified) {
  // Error: must verify email first
}
```

**Optional enhancement** (if enforcing dual-auth):
```typescript
if (user.authStatus !== 'DUAL_AUTH') {
  // Error: must complete account setup (link Steam or verify email)
  return NextResponse.json({
    error: 'Please complete account setup',
    authStatus: user.authStatus,
    nextStep: 'Link your Steam account' // or 'Verify your email'
  }, { status: 403 });
}
```

### Step 2.4: Update `/api/auth/me`

**Add to response**:
```typescript
const responseData = {
  // ... existing fields ...
  steamId: (user as any).steamId || null,
  steamIdVerified: Boolean((user as any).steamIdVerified),
  emailVerified: Boolean((user as any).emailVerified),
  authStatus: (user as any).authStatus || 'INCOMPLETE',
  authMethods: {
    email: Boolean((user as any).emailVerified),
    steam: Boolean((user as any).steamIdVerified),
  },
};
```

### Step 2.5: Update `/api/auth/verify-email`

**Add at end**:
```typescript
if (verifiedUserId) {
  // Check if user now has both auth methods
  const [user] = await db.select().from(users).where(eq(users.id, verifiedUserId)).limit(1);
  
  if (user?.steamIdVerified && user?.emailVerified) {
    // Update to full auth status
    await db.update(users)
      .set({ authStatus: 'DUAL_AUTH', emailVerifiedAt: new Date() })
      .where(eq(users.id, verifiedUserId));
  } else if (user?.emailVerified && !user?.steamIdVerified) {
    await db.update(users)
      .set({ authStatus: 'EMAIL_ONLY', emailVerifiedAt: new Date() })
      .where(eq(users.id, verifiedUserId));
  }
}
```

### Step 2.6: Create NEW `/api/auth/link-steam` Endpoint

**Purpose**: Allow email-verified users to link their Steam account

```typescript
// POST /api/auth/link-steam - Initiates Steam linking
// - Get current user from session
- Validate user has email verified
- Redirect to Steam OAuth (with state=link-steam)
- Return { redirectUrl: '...' }

// /api/auth/steam/return?state=link-steam
// - Extract state param
// - If state=link-steam:
//   - Get current user
//   - Don't create new user
//   - Update existing user with steamId + steamIdVerified: true
//   - Update authStatus to DUAL_AUTH
//   - Redirect to dashboard with success param
```

### Step 2.7: Create NEW `/api/auth/update-email-for-steam` Endpoint

**Purpose**: Allow Steam users to provide email for verification

```typescript
// POST /api/auth/update-email-for-steam
// - Get current user (must have steamId)
// - Accept new email
// - Validate email not in use
// - Update user.email
// - Generate verification token
// - Send verification email
// - Return { message: 'Verification email sent' }
```

---

## Phase 3: Frontend Updates

### Step 3.1: Update `/api/auth/me` Response Handling

**File**: `src/contexts/UserContext.tsx`

```typescript
interface User {
  id: string;
  email: string | null;
  username: string;
  avatarUrl?: string;
  level: number;
  role?: string;
  steamId?: string | null;
  steamIdVerified?: boolean;
  emailVerified?: boolean;
  authStatus?: string; // INCOMPLETE, EMAIL_ONLY, STEAM_ONLY, DUAL_AUTH
  authMethods?: {
    email: boolean;
    steam: boolean;
  };
  [key: string]: any;
}
```

### Step 3.2: Create Auth Status Component

**File**: `src/components/auth/AuthStatusBadge.tsx`

```typescript
'use client';

import { CheckCircle, AlertCircle, Mail, Github } from 'lucide-react';
import { SteamIcon } from '@/components/icons/SteamIcon';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface AuthStatusBadgeProps {
  emailVerified: boolean;
  steamIdVerified: boolean;
  authStatus?: string;
  className?: string;
}

export function AuthStatusBadge({
  emailVerified,
  steamIdVerified,
  authStatus,
  className
}: AuthStatusBadgeProps) {
  if (!emailVerified && !steamIdVerified) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <AlertCircle className={cn("h-4 w-4 text-yellow-500", className)} />
        </TooltipTrigger>
        <TooltipContent>Auth incomplete - verify email & link Steam</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className={cn("flex gap-1", className)}>
      {emailVerified && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Mail className="h-4 w-4 text-green-500" />
          </TooltipTrigger>
          <TooltipContent>Email verified</TooltipContent>
        </Tooltip>
      )}
      {steamIdVerified && (
        <Tooltip>
          <TooltipTrigger asChild>
            <SteamIcon className="h-4 w-4 text-blue-400" />
          </TooltipTrigger>
          <TooltipContent>Steam linked</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
```

### Step 3.3: Create Account Linking Modal

**File**: `src/components/auth/AccountLinkingModal.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SteamIcon } from '@/components/icons/SteamIcon';
import { Mail } from 'lucide-react';

interface AccountLinkingModalProps {
  open: boolean;
  authStatus: string; // EMAIL_ONLY, STEAM_ONLY, INCOMPLETE
  onOpenChange: (open: boolean) => void;
  onLinked?: () => void;
}

export function AccountLinkingModal({
  open,
  authStatus,
  onOpenChange,
  onLinked
}: AccountLinkingModalProps) {
  const router = useRouter();
  const [isLinking, setIsLinking] = useState(false);

  const handleLinkSteam = async () => {
    setIsLinking(true);
    try {
      window.location.href = '/api/auth/link-steam';
    } catch (error) {
      console.error('Failed to link Steam:', error);
      setIsLinking(false);
    }
  };

  const handleAddEmail = () => {
    // Open form to add email
    onOpenChange(false);
    // Navigate to settings or open sub-dialog
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Your Account Setup</DialogTitle>
          <DialogDescription>
            Link your Steam account and verify your email to unlock all features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {authStatus === 'STEAM_ONLY' && (
            <Button 
              onClick={handleAddEmail}
              variant="outline"
              className="w-full"
            >
              <Mail className="mr-2 h-4 w-4" />
              Add & Verify Email
            </Button>
          )}

          {authStatus === 'EMAIL_ONLY' && (
            <Button 
              onClick={handleLinkSteam}
              disabled={isLinking}
              className="w-full"
            >
              <SteamIcon className="mr-2 h-4 w-4" />
              {isLinking ? 'Linking...' : 'Link Steam Account'}
            </Button>
          )}

          {authStatus === 'INCOMPLETE' && (
            <>
              <Button 
                onClick={handleAddEmail}
                variant="outline"
                className="w-full"
              >
                <Mail className="mr-2 h-4 w-4" />
                Verify Email
              </Button>
              <Button 
                onClick={handleLinkSteam}
                disabled={isLinking}
                className="w-full"
              >
                <SteamIcon className="mr-2 h-4 w-4" />
                {isLinking ? 'Linking...' : 'Link Steam'}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Step 3.4: Update Collapsible Header

**File**: `src/components/layout/collapsible-header.tsx`

Add auth status badge next to username:

```typescript
import { AuthStatusBadge } from '@/components/auth/AuthStatusBadge';

// In render:
{user && (
  <Button variant="ghost" className="flex items-center gap-2">
    <UserAvatar avatarUrl={user.avatarUrl || ''} username={user.username || ''} className="h-8 w-8" />
    <UserName username={user.username} role={isAdmin ? 'ADMIN' : (user as any).role} className="hidden md:inline" />
    <AuthStatusBadge 
      emailVerified={(user as any).emailVerified || false}
      steamIdVerified={(user as any).steamIdVerified || false}
      authStatus={(user as any).authStatus}
    />
  </Button>
)}
```

### Step 3.5: Add Modal to Dashboard

**File**: `src/app/(app)/dashboard/page.tsx` or layout

```typescript
'use client';

import { useUser } from '@/hooks/use-user';
import { AccountLinkingModal } from '@/components/auth/AccountLinkingModal';
import { useState, useEffect } from 'react';

export default function DashboardLayout() {
  const { user, refetch } = useUser();
  const [showLinkingModal, setShowLinkingModal] = useState(false);

  useEffect(() => {
    // Show modal if auth incomplete
    if (user && (user as any).authStatus !== 'DUAL_AUTH' && (user as any).authStatus !== 'EMAIL_ONLY' && (user as any).authStatus !== 'STEAM_ONLY') {
      setShowLinkingModal(true);
    }
  }, [user]);

  return (
    <>
      {/* Your dashboard content */}
      
      <AccountLinkingModal
        open={showLinkingModal}
        authStatus={(user as any).authStatus}
        onOpenChange={setShowLinkingModal}
        onLinked={() => {
          refetch();
          setShowLinkingModal(false);
        }}
      />
    </>
  );
}
```

---

## Phase 4: Testing

### Test Cases

1. **Email Registration Flow**
   - [ ] Register with email → get verification email
   - [ ] Click email link → verify email
   - [ ] Check DB: emailVerified=true, steamId=null, authStatus=EMAIL_ONLY
   - [ ] Show "Link Steam" prompt on dashboard
   - [ ] Can login with email/password

2. **Steam Registration Flow**
   - [ ] Click "Sign up with Steam"
   - [ ] Authenticate with Steam
   - [ ] Redirected to email capture (or Steam email shown)
   - [ ] Receive verification email
   - [ ] Click verify link
   - [ ] Check DB: steamIdVerified=true, emailVerified=true, authStatus=DUAL_AUTH
   - [ ] Can login with Steam

3. **Account Linking (Email → Steam)**
   - [ ] Login with email
   - [ ] See "Link Steam" button on dashboard
   - [ ] Click → redirect to Steam OAuth
   - [ ] Authenticate with Steam
   - [ ] Redirect back with steamId attached
   - [ ] Check DB: both verified, authStatus=DUAL_AUTH

4. **Account Linking (Steam → Email)**
   - [ ] Login with Steam
   - [ ] See "Add Email" on dashboard
   - [ ] Enter email → get verification email
   - [ ] Click verify
   - [ ] Check DB: both verified, authStatus=DUAL_AUTH

5. **Mini Profile Card**
   - [ ] Check collapsible header shows correct icons
   - [ ] Email only: shows only email icon
   - [ ] Steam only: shows only Steam icon
   - [ ] Both: shows both icons
   - [ ] Incomplete: shows warning icon

---

## Implementation Order

1. **Database Migration** (create .sql file)
2. **Update schema.ts** (Drizzle types)
3. **Fix `/api/auth/register`** (email registration)
4. **Fix `/api/auth/steam/return`** (steam auth)
5. **Update `/api/auth/verify-email`** (status tracking)
6. **Update `/api/auth/me`** (return auth status)
7. **Create `/api/auth/link-steam`** (new endpoint)
8. **Update UserContext** (handle new fields)
9. **Create AuthStatusBadge component** (UI)
10. **Create AccountLinkingModal component** (UI)
11. **Update CollapsibleHeader** (show badges)
12. **Add modal to Dashboard** (trigger linking flow)
13. **Test all flows**

---

## Estimated Effort

- Database changes: 30 min
- API endpoint changes: 2 hours
- Frontend components: 1.5 hours  
- Integration testing: 1 hour
- **Total: ~5 hours**

---

## Rollout Plan

1. Deploy database migration
2. Deploy backend changes (new endpoints + updated endpoints)
3. Deploy frontend changes
4. Test in staging
5. Monitor production for any issues
6. Send user notifications about new auth requirement (optional)

