# ⚡ Quick Start Guide

## 🎯 Everything is Configured!

Your environment variables are all set up. Here's what to do next:

## 1️⃣ Start the Server

```bash
npm run dev
```

The app will run on `http://localhost:9002`

## 2️⃣ Check Health Status

Visit: `http://localhost:9002/api/health`

This will show you:
- ✅ Database connection status
- ✅ Email configuration
- ✅ All service statuses
- ⚠️ Any missing configurations

## 3️⃣ Test the Platform

### Register First User
1. Go to the landing page
2. Click "Register" or "Login"
3. Create an account
4. Check your email for verification (if EMAIL_USER/PASSWORD are set)

### Make Your First Admin
After creating your first user, update their role in the database:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

Or use the admin API endpoint if you have access.

## 📊 Feature Checklist

Test these features:

- ✅ **Authentication**
  - Register new account
  - Login
  - Email verification (check email)
  - Password reset (if needed)

- ✅ **Shop**
  - Browse cosmetics
  - Purchase items (need coins)
  - Equip cosmetics

- ✅ **Matchmaking**
  - Join queue
  - Check queue status
  - Leave queue

- ✅ **Dashboard**
  - View stats
  - See recent matches
  - Check progression

- ✅ **Support**
  - Submit support ticket
  - Receive confirmation email

- ✅ **Admin** (if you're admin)
  - View users at `/admin/users`
  - Manage cosmetics at `/admin/cosmetics`
  - Review AC events at `/admin/anti-cheat`

## 🔍 Troubleshooting

### Can't connect to database?
- Check `DATABASE_URL` is correct
- Verify SSL mode in connection string
- Test connection in database client

### Emails not sending?
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` are set
- Check one.com account settings
- Look in server logs for SMTP errors

### API errors?
- Check `/api/health` endpoint
- Verify all required env vars
- Check browser console for errors

## 🚀 Next Steps

1. **Create admin user** (update role in DB)
2. **Add seed data** (cosmetics, missions via admin panel)
3. **Test all features**
4. **Configure GCP** for match servers
5. **Deploy to production**

## 📝 Important URLs

- **App:** http://localhost:9002
- **Health Check:** http://localhost:9002/api/health
- **API Base:** http://localhost:3001 (if running separately)

## ✨ You're Ready!

Everything is configured. Just start the server and begin testing!

```bash
npm run dev
```

Happy coding! 🎮

