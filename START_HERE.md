# 🚀 Eclip.pro - Startup Guide

## ✅ Quick Start

All environment variables are configured! Your platform is ready to run.

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will start on `http://localhost:9002` (as configured in package.json)

## 📋 Environment Variables Checklist

All these should be in your `.env.local` file:

### ✅ Database
- `DATABASE_URL` - Neon PostgreSQL connection string

### ✅ Authentication
- `JWT_SECRET` - JWT token signing secret
- `SESSION_SECRET` - Session cookie secret

### ✅ Email (one.com SMTP)
- `EMAIL_USER` - noreply@eclip.pro
- `EMAIL_PASSWORD` - Your one.com email password
- `SUPPORT_EMAIL` - support@eclip.pro (optional)

### ✅ Redis (Optional but Recommended)
- `REDIS_URL` - Redis connection string

### ✅ Steam (Optional)
- `STEAM_API_KEY` - Steam Web API key
- `STEAM_REALM` - http://localhost:3000
- `STEAM_RETURN_URL` - http://localhost:3000/api/auth/steam/return

### ✅ GCP (For CS2 Server Orchestration)
- `GCP_PROJECT_ID`
- `GCP_REGION`
- `GCP_COMPUTE_ZONE`
- And other GCP variables...

### ✅ Other
- `API_BASE_URL` - http://localhost:3001
- `WS_URL` - ws://localhost:3001
- `NODE_ENV` - development
- `AC_INGEST_SECRET` - Anti-cheat secret

## 🎯 First Steps

### 1. Create Admin User

You'll need to create an admin user directly in the database or via API. Here's a quick SQL:

```sql
INSERT INTO users (email, username, password_hash, role, email_verified, level, xp, mmr, rank, coins)
VALUES (
  'admin@eclip.pro',
  'admin',
  '$2a$10$...', -- Use bcrypt to hash your password
  'ADMIN',
  true,
  1,
  0,
  1000,
  'Bronze',
  '0'
);
```

Or use the registration API and manually update the role in the database.

### 2. Test Email Configuration

1. Register a new account
2. Check your email for verification link
3. Verify the account works

### 3. Test Core Features

- ✅ Register/Login
- ✅ Browse shop
- ✅ Join matchmaking queue
- ✅ View leaderboards
- ✅ Submit support ticket

## 🔧 Common Issues

### Database Connection
- Verify `DATABASE_URL` is correct
- Check SSL mode in connection string
- Ensure database is accessible

### Email Not Sending
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` are correct
- Check one.com account allows SMTP
- May need app-specific password
- Check spam folder

### API Errors
- Check all required env vars are set
- Verify JWT_SECRET is set
- Check database connection

## 📝 Next Steps After Startup

1. **Create Admin User** - First admin account
2. **Seed Data** - Add some cosmetics, missions
3. **Test All Features** - Go through each feature
4. **Configure GCP** - For CS2 server orchestration
5. **Deploy** - To Vercel when ready

## 🎮 Testing the Platform

### Test User Flow:
1. Register → Receive verification email
2. Login → Access dashboard
3. Join queue → Test matchmaking
4. Purchase cosmetic → Test shop
5. Submit support ticket → Test email

### Test Admin Flow:
1. Login as admin
2. Access `/admin` routes
3. View users, matches, cosmetics
4. Review anti-cheat events

## 🚀 Ready to Deploy?

Before deploying to production:

1. Update environment variables for production
2. Change `API_BASE_URL` and `WS_URL` to production URLs
3. Set `NODE_ENV=production`
4. Configure production database
5. Set up production email
6. Configure production GCP

## ✨ You're All Set!

Everything is configured and ready. Just run:

```bash
npm run dev
```

And start building! 🎉

