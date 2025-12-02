# Troubleshooting Guide - December 2, 2025

## Issues Identified & Fixed

### 1. Dashboard Loading Issue (Infinite Loading Spinner)
**Problem**: After successful email registration, dashboard shows loading spinner indefinitely
**Root Cause**: The `useUser` hook successfully fetches user data from `/api/auth/me`, but the dashboard component may not be receiving the data properly
**Fix Applied**: 
- Added detailed logging to `useUser` hook to trace the authentication flow
- Added logging to `/api/auth/me` to track when users are authenticated
- Logs will show in browser console and server logs

### 2. Email Verification Not Sending
**Problem**: Users don't receive verification emails from noreply@eclip.pro
**Root Cause**: Email credentials may not be configured in environment variables
**Fix Applied**:
- Enhanced logging in email system to show when emails are skipped due to missing credentials
- Added detailed error logging to track email sending failures
- System will log: "Email credentials not configured" if EMAIL_USER or EMAIL_PASSWORD is missing

**Required Environment Variables**:
```env
EMAIL_USER=noreply@eclip.pro
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=noreply@eclip.pro
```

### 3. Steam Authentication Issues
**Problem**: Steam login redirects back to landing page instead of dashboard
**Fix Applied**:
- Added comprehensive logging throughout Steam auth flow
- Logs Steam ID extraction, session creation, and cookie setting
- Enhanced error messages for debugging

### 4. Git Sync Issues
**Problem**: Unable to push changes to GitHub, getting git errors
**Possible Causes**:
- Uncommitted changes in working directory
- Network issues
- Authentication problems with GitHub

**Solutions**:
1. Check git status: `git status`
2. Commit all changes: `git add -A && git commit -m "Your message"`
3. Pull latest changes: `git pull origin master --rebase`
4. Push changes: `git push origin master`

## Debugging Tools Added

### 1. Session Debug Endpoint
**URL**: `/api/debug/session`
**Purpose**: Check if session cookies are being set and read correctly
**Returns**:
```json
{
  "hasCookies": true,
  "cookieCount": 1,
  "cookieNames": ["session"],
  "hasSession": true,
  "sessionValue": "eyJhbGciOiJIUzI1NiIs...",
  "decoded": { "userId": "uuid-here" },
  "timestamp": "2025-12-02T..."
}
```

### 2. Enhanced Console Logging
All authentication flows now log detailed information:
- `[useUser]` - Frontend user authentication
- `[Auth]` - Backend session management
- `[API/Auth/Me]` - User verification endpoint
- `[Steam Auth]` - Steam authentication flow
- `[Register]` - Registration process
- `[Email]` - Email sending status

## Testing Steps

### Test Email Registration Flow:
1. Register with a new email
2. Check browser console for `[useUser]` logs
3. Check server logs for `[Register]` and `[Email]` logs
4. If email not sent, check for "Email credentials not configured" message
5. Navigate to `/api/debug/session` to verify cookie is set

### Test Steam Login Flow:
1. Click "Sign in with Steam"
2. Complete Steam authentication
3. Check server logs for `[Steam Auth]` messages
4. Should see "Created session" and redirect to dashboard
5. Check browser console for `[useUser]` logs
6. Navigate to `/api/debug/session` to verify cookie is set

### Test Dashboard Access:
1. After successful login, check browser console
2. Should see: `[useUser] User data received: {...}`
3. If stuck on loading, check for 401 errors in Network tab
4. Visit `/api/debug/session` to verify authentication state

## Common Issues & Solutions

### Issue: "Email credentials not configured"
**Solution**: Add EMAIL_USER and EMAIL_PASSWORD to your environment variables (Vercel dashboard or .env.local)

### Issue: Dashboard shows loading forever
**Checks**:
1. Open browser DevTools > Console
2. Look for `[useUser]` logs
3. Check Network tab for `/api/auth/me` response
4. If 401 error, cookies are not being set/read
5. Visit `/api/debug/session` to diagnose cookie issues

### Issue: Steam login redirects to landing page
**Checks**:
1. Check server logs for `[Steam Auth]` messages
2. Look for "Created session" log entry
3. Verify STEAM_API_KEY is set in environment
4. Check if cookies are blocked in browser
5. Visit `/api/debug/session` after login attempt

### Issue: Git push fails
**Solution**:
```bash
# Check status
git status

# Commit changes
git add .
git commit -m "Fix authentication and email issues"

# Pull and rebase
git pull origin master --rebase

# Push
git push origin master

# If still fails, try force push (use carefully)
git push origin master --force
```

## Next Steps

1. **Deploy to Vercel**:
   - Push changes to GitHub
   - Vercel will auto-deploy
   - Check deployment logs for errors

2. **Configure Email**:
   - Go to Vercel dashboard
   - Add EMAIL_USER and EMAIL_PASSWORD environment variables
   - Redeploy

3. **Test Live**:
   - Try registration on live site
   - Check Vercel logs for `[Register]` and `[Email]` entries
   - Test Steam login
   - Use `/api/debug/session` endpoint to verify cookies

4. **Monitor Logs**:
   - All new logging will appear in Vercel logs
   - Use filters to search for specific tags like `[Email]` or `[Steam Auth]`

## Environment Variables Checklist

Make sure these are set in Vercel:
- ✅ DATABASE_URL
- ✅ JWT_SECRET
- ✅ SESSION_SECRET
- ✅ STEAM_API_KEY
- ✅ STEAM_REALM
- ✅ STEAM_RETURN_URL
- ⚠️ EMAIL_USER (required for email verification)
- ⚠️ EMAIL_PASSWORD (required for email verification)
- ✅ API_BASE_URL

## Contact & Support

If issues persist after following this guide:
1. Check Vercel deployment logs
2. Use `/api/debug/session` endpoint to diagnose cookie issues
3. Check browser console for detailed error messages
4. Verify all environment variables are set correctly
