# Email Configuration Guide

## Environment Variables

Add these to your `.env.local` file:

```env
EMAIL_USER=noreply@eclip.pro
EMAIL_PASSWORD=your_email_password_here
SUPPORT_EMAIL=support@eclip.pro
```

## Email Server Details

Your email is configured to use one.com's SMTP server:

- **SMTP Server:** send.one.com
- **SMTP Port:** 465
- **Security:** SSL/TLS (secure: true)
- **From Address:** noreply@eclip.pro

## Features Implemented

### ✅ Email Verification
- Sent automatically when users register
- Contains verification link
- Expires after 24 hours
- Endpoint: `/api/auth/verify-email?token=...`

### ✅ Password Reset
- Users can request password reset via email
- Reset link expires after 1 hour
- Secure token-based reset
- Endpoints:
  - `POST /api/auth/reset-password` (request reset)
  - `POST /api/auth/reset-password` (with token to reset)

### ✅ Support Tickets
- Users can submit support tickets
- Ticket confirmation sent to user
- Support team receives notification
- Endpoint: `POST /api/support`

### ✅ Email Notifications
- Match found notifications
- Rank up notifications
- Achievement unlocks
- General notifications

## Testing Email

To test if email is working:

1. Register a new account - should receive verification email
2. Request password reset - should receive reset email
3. Submit support ticket - should receive confirmation

## Troubleshooting

If emails are not sending:

1. Check that `EMAIL_USER` and `EMAIL_PASSWORD` are set correctly
2. Verify your email password is correct (may need app-specific password)
3. Check server logs for SMTP errors
4. Ensure port 465 is not blocked by firewall
5. Verify one.com account has SMTP enabled

## Email Templates

All emails use modern HTML templates with:
- Responsive design
- Brand colors (neon green #39FF14, purple #BF00FF)
- Professional styling
- Mobile-friendly layout

