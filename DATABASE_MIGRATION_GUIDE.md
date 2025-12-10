# Database Migration Guide - Eclip

## ✅ Quick Start

Run these commands to ensure your database is fully set up:

```bash
# 1. Verify current database schema
npm run verify:db

# 2. If direct_messages table is missing, create it
npm run migrate:db
```

---

## 🔍 What to Look For

After running `npm run verify:db`, you should see:

```
✓ users
✓ sessions
✓ notifications
✓ direct_messages        <- This is the new one
✓ cosmetics
✓ missions
✓ achievements
✓ badges

--- Users Table Columns ---
✓ is_admin (boolean)
✓ is_moderator (boolean)
✓ avatar_url (text)

--- Direct Messages Table ---
✓ id (uuid)
✓ sender_id (uuid)
✓ recipient_id (uuid)
✓ content (text)
✓ read (boolean)
✓ created_at (timestamp with time zone)

Indexes: 3
  - idx_direct_messages_sender_id
  - idx_direct_messages_recipient_id
  - idx_direct_messages_read
```

---

## ⚠️ If direct_messages doesn't exist

The migration may have failed silently. Here are the fixes:

### Option 1: Run TypeScript migration (Recommended)
```bash
npm run migrate:db
```

This will:
- Create the `direct_messages` table
- Add missing columns to `users` table
- Create necessary indexes
- Verify everything worked

### Option 2: Manual SQL (if TypeScript fails)

Connect to your Neon database and run:

```sql
-- Create direct_messages table
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_id 
ON public.direct_messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_direct_messages_recipient_id 
ON public.direct_messages(recipient_id);

CREATE INDEX IF NOT EXISTS idx_direct_messages_read 
ON public.direct_messages(read);

-- Add missing columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_moderator BOOLEAN DEFAULT false;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;
```

### Option 3: Using Neon SQL Editor
1. Go to your Neon dashboard
2. Open the SQL editor
3. Copy and paste the SQL from Option 2
4. Execute

---

## 🧪 Testing After Migration

After running the migration, test the API:

```bash
# 1. Start your dev server
npm run dev

# 2. Test messages API (in another terminal)
curl -X GET http://localhost:3000/api/messages \
  -H "Cookie: session=your-session-token"

# Expected response:
# { "conversations": [...], "totalUnread": 0 }
```

---

## 🔧 Troubleshooting

### Issue: "connect ECONNREFUSED" error
**Cause**: DATABASE_URL not set or database connection failed

**Fix**:
```bash
# Check if DATABASE_URL is set
echo $DATABASE_URL

# If empty, set it
export DATABASE_URL="postgresql://..."

# Then try again
npm run verify:db
```

### Issue: "role_permissions table not found"
**Cause**: The migration file missed this table

**Fix**: Run this SQL in Neon:
```sql
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_user_id 
ON public.role_permissions(user_id);
```

### Issue: "column already exists" error
**Fix**: This is normal and means the migration already ran. Just ignore it.

---

## 📊 Checking Database in Neon Console

1. Go to https://console.neon.tech
2. Select your project
3. Click "SQL Editor"
4. Run this to see all tables:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

5. To see direct_messages structure:
```sql
\dt direct_messages
\d direct_messages
```

---

## ✨ Final Verification

All of these should work:

```bash
# Start server
npm run dev

# In new terminal - verify database
npm run verify:db

# Test messages endpoint
curl http://localhost:3000/api/messages -H "Cookie: session=..."

# Messages should appear in header dropdown on web app
# Verify in browser console - should see fetch to /api/messages
```

Once you see `direct_messages` table with all columns and indexes, **you're all set! 🎉**
