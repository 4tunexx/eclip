# 🚀 Deployment Checklist - Next Steps

Since all environment variables are already in `.env` and Vercel, here's what else needs to be done:

## ✅ Already Complete

- ✅ All environment variables configured
- ✅ All code implemented
- ✅ Database tables created (per user confirmation)
- ✅ All APIs functional
- ✅ All frontend pages wired

## 📋 Remaining Steps

### 1. ✅ Verify Database Connection

**Check if database is accessible:**
```bash
# Test database connection
npm run dev
# Then visit: http://localhost:9002/api/health
```

The health endpoint will verify:
- Database connection ✅
- Redis connection (if configured) ✅
- All environment variables ✅

### 2. 🔐 Create First Admin User

**Option A: Via API (Recommended)**

1. Register a normal user via `/register` page
2. Connect to your database and update the role:

```sql
-- Find your user
SELECT id, email, username FROM users WHERE email = 'your-email@eclip.pro';

-- Update to admin (replace USER_ID with actual ID)
UPDATE users 
SET role = 'ADMIN' 
WHERE id = 'USER_ID';
```

**Option B: Direct SQL Insert**

```sql
-- Generate password hash first (use Node.js bcrypt or online tool)
-- Then insert:

INSERT INTO users (
  email, 
  username, 
  password_hash, 
  role, 
  email_verified, 
  level, 
  xp, 
  mmr, 
  rank, 
  coins,
  created_at
)
VALUES (
  'admin@eclip.pro',
  'admin',
  '$2a$10$YourBcryptHashHere', -- Use bcrypt to hash password
  'ADMIN',
  true,
  1,
  0,
  1000,
  'Bronze',
  '0',
  NOW()
);
```

**Quick Password Hash Generator Script:**

Create `scripts/hash-password.js`:
```javascript
const bcrypt = require('bcryptjs');

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/hash-password.js <password>');
  process.exit(1);
}

bcrypt.hash(password, 10).then(hash => {
  console.log('Password hash:', hash);
});
```

Run: `node scripts/hash-password.js yourpassword`

### 3. 🌱 Seed Initial Data (Optional but Recommended)

**Add some cosmetics to the shop:**

```sql
-- Insert sample cosmetics
INSERT INTO cosmetics (name, type, rarity, price, image_url, is_active)
VALUES
  ('Cool Avatar', 'AVATAR', 'Common', 100, 'https://via.placeholder.com/150', true),
  ('Epic Badge', 'BADGE', 'Epic', 500, 'https://via.placeholder.com/150', true),
  ('Legendary Border', 'BORDER', 'Legendary', 1000, 'https://via.placeholder.com/150', true);
```

**Add forum categories:**

```sql
INSERT INTO forum_categories (name, description, order_index)
VALUES
  ('Announcements', 'Platform updates and news', 1),
  ('General Discussion', 'Talk about anything', 2),
  ('Feedback', 'Share your feedback', 3),
  ('Bug Reports', 'Report bugs here', 4);
```

**Add missions:**

```sql
INSERT INTO missions (title, description, type, target_value, reward_xp, reward_coins, is_active)
VALUES
  ('Win 5 Matches', 'Win 5 competitive matches', 'WINS', 5, 500, 50, true),
  ('Get 50 Kills', 'Get 50 kills across all matches', 'KILLS', 50, 300, 30, true),
  ('Play 10 Matches', 'Complete 10 matches', 'MATCHES_PLAYED', 10, 200, 20, true);
```

### 4. 🔧 Update Production URLs (For Vercel)

**Before deploying, update these in Vercel environment variables:**

- `API_BASE_URL` → `https://your-domain.vercel.app`
- `WS_URL` → `wss://your-domain.vercel.app` (if using WebSockets)
- `STEAM_REALM` → `https://your-domain.vercel.app`
- `STEAM_RETURN_URL` → `https://your-domain.vercel.app/api/auth/steam/return`

**For local development:**
- `API_BASE_URL` → `http://localhost:9002`
- `WS_URL` → `ws://localhost:9002`

### 5. 🚀 Deploy to Vercel

**Option A: Via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production deploy
vercel --prod
```

**Option B: Via GitHub Integration**

1. Push your code to GitHub
2. Connect repo to Vercel
3. Vercel will auto-deploy on push

**Vercel Configuration:**

- **Framework Preset:** Next.js
- **Root Directory:** `./` (default)
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### 6. ✅ Verify Deployment

After deployment, test:

1. **Health Check:**
   ```
   GET https://your-domain.vercel.app/api/health
   ```

2. **Test Authentication:**
   - Register new user
   - Verify email received
   - Login works

3. **Test Admin Panel:**
   - Login as admin
   - Access `/admin` routes
   - View users/matches/cosmetics

4. **Test Core Features:**
   - Shop (purchase/equip)
   - Queue system
   - Leaderboards
   - Forum

### 7. 🔒 Security Checklist

- [ ] All secrets in Vercel env vars (not in code)
- [ ] `NODE_ENV=production` in production
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Database connection uses SSL
- [ ] JWT_SECRET is strong and unique
- [ ] CORS configured (if needed)

### 8. 📊 Monitoring Setup (Optional)

**Recommended:**
- Set up Vercel Analytics
- Add error tracking (Sentry, etc.)
- Monitor database performance
- Set up uptime monitoring

### 9. 🎯 Post-Deployment Tasks

- [ ] Create admin user (see step 2)
- [ ] Seed initial data (see step 3)
- [ ] Test email sending
- [ ] Test all user flows
- [ ] Configure custom domain (if needed)
- [ ] Set up production Redis (if using)
- [ ] Configure GCP for CS2 servers (if using)

## 🚨 Important Notes

### Database

Since you mentioned tables are already created, the schema is in sync. However:

- **No migrations needed** - tables already exist
- **Schema is defined** in `src/lib/db/schema.ts`
- **Drizzle is configured** for querying only

If you need to modify schema later, you can:
1. Update `src/lib/db/schema.ts`
2. Manually run SQL migrations
3. Or set up Drizzle Kit migrations

### Environment Variables in Vercel

Make sure these are set in Vercel dashboard:
- `DATABASE_URL`
- `JWT_SECRET`
- `SESSION_SECRET`
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- And all other variables from your `.env`

## 🎉 Quick Start Commands

```bash
# 1. Install dependencies (if not done)
npm install

# 2. Start dev server
npm run dev

# 3. Test locally
open http://localhost:9002

# 4. When ready, deploy
vercel --prod
```

## 📝 Next Steps Summary

1. ✅ **Verify health endpoint works**
2. ✅ **Create admin user**
3. ✅ **Seed initial data** (optional)
4. ✅ **Deploy to Vercel**
5. ✅ **Update production URLs**
6. ✅ **Test everything**
7. ✅ **Enjoy your platform!** 🎮

## 🆘 Troubleshooting

**Database connection fails:**
- Verify `DATABASE_URL` in Vercel
- Check SSL mode in connection string
- Verify database is accessible

**Email not sending:**
- Check `EMAIL_USER` and `EMAIL_PASSWORD` in Vercel
- Verify one.com SMTP settings
- Check spam folder

**Build fails:**
- Check all dependencies installed
- Verify Node.js version (18+)
- Check for TypeScript errors: `npm run typecheck`

**API errors:**
- Check all env vars are set
- Verify database connection
- Check API logs in Vercel dashboard

---

**That's it! You're ready to deploy! 🚀**

