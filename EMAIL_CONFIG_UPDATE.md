# Email Configuration Update - December 10, 2025

## Problem
Email verification was failing with `ETIMEDOUT` error when trying to connect to mailout.one.com on port 465.

Root causes:
1. Special characters in password (`$`) were not being properly URL-encoded
2. Email credentials were not being passed correctly to nodemailer
3. Vercel might be blocking URL-based SMTP configurations

## Solution Implemented
Changed from URL-based EMAIL_SERVER to individual credential variables for better reliability.

## Required Vercel Environment Variables

**Add or Update these in Vercel Settings → Environment Variables:**

```
EMAIL_USER=noreply@eclip.pro
EMAIL_PASSWORD=ek6UB9Q$uayqyed
EMAIL_HOST=mailout.one.com
EMAIL_PORT=465
EMAIL_FROM=noreply@eclip.pro
EMAIL_VERIFY_URL=https://eclip.pro/api/auth/verify-email
```

**Remove or Delete:**
- `EMAIL_SERVER` (the old URL-based configuration)

## Files Modified
1. `src/lib/config.ts` - Added `host` and `port` fields to email config
2. `src/lib/email.ts` - Updated transporter initialization to use individual credentials
3. `.env.local` - Updated with separate variables

## Testing
After updating Vercel environment variables:
1. Go to https://eclip.pro/register
2. Create a test account with a valid email
3. Check inbox and spam folder for verification email
4. Click verification link to complete registration

## Debugging
If emails still don't arrive:
1. Check Vercel deployment logs: Dashboard → Functions/Logs
2. Look for "[Email]" log entries
3. Verify EMAIL_USER and EMAIL_PASSWORD are correct for your one.com account
4. Ensure port 465 is accessible from Vercel (may require paid plan)
