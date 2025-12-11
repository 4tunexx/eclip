import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key from environment
const sendgridApiKey = process.env.SENDGRID_API_KEY;

if (sendgridApiKey) {
  sgMail.setApiKey(sendgridApiKey);
}

function wrapEmail(inner: string) {
  return `
  <div style="background:#0a0a0a;padding:40px;font-family:Arial;color:#e6e6e6;">
    <div style="max-width:600px;margin:auto;background:#111;padding:30px;border-radius:12px;
                border:1px solid #00ffae33;box-shadow:0 0 20px #00ffae33;">
      ${inner}
      <p style="margin-top:40px;font-size:12px;color:#777;">
        Eclip Pro — Competitive CS2 Platform
      </p>
    </div>
  </div>`;
}

export async function sendEclipEmail(
  to: string,
  subject: string,
  htmlContent: string
) {
  // Check if SendGrid is configured
  if (!sendgridApiKey) {
    console.error('[SendGrid] API key not configured. Email not sent.');
    console.log('[SendGrid] To:', to, 'Subject:', subject);
    return;
  }

  const wrapped = wrapEmail(htmlContent);

  try {
    await sgMail.send({
      to,
      from: {
        email: process.env.SENDGRID_FROM || 'noreply@eclip.pro',
        name: process.env.SENDGRID_FROM_NAME || 'Eclip Pro',
      },
      subject,
      html: wrapped,
    });

    console.log('[SendGrid] Email sent successfully to:', to);
  } catch (err) {
    console.error('[SendGrid] Error sending email:', err);
    throw err;
  }
}

// Backwards compatibility wrapper for sendEmail
export async function sendEmail(options: { to: string; subject: string; html: string; text?: string }): Promise<void> {
  return sendEclipEmail(options.to, options.subject, options.html);
}

export async function sendVerificationEmail(email: string, token: string, username: string) {
  console.log('[SendGrid] Sending verification email to:', email);

  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.eclip.pro'}/api/auth/verify-email?token=${token}`;

  const html = `
    <h1 style="color:#00ffae;margin-top:0;">Welcome to Eclip Pro, ${username}!</h1>
    <p>Thank you for registering on Eclip Pro. To complete your registration, please verify your email address by clicking the button below:</p>
    <div style="text-align:center;margin:30px 0;">
      <a href="${verificationUrl}" 
        style="display:inline-block;background:#00ffae;color:#000;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:16px;">
        Verify Email Address
      </a>
    </div>
    <p style="margin-top:30px;font-size:14px;">Or copy and paste this link:</p>
    <p style="word-break:break-all;color:#00ffae;font-size:12px;">${verificationUrl}</p>
    <p style="margin-top:20px;color:#999;font-size:12px;">This link will expire in 24 hours.</p>
    <p style="margin-top:20px;color:#999;font-size:12px;">If you didn't create an account on Eclip Pro, please ignore this email.</p>
  `;

  await sendEclipEmail(email, 'Verify your Eclip Pro account', html);
}

export async function sendPasswordResetEmail(email: string, token: string, username: string) {
  console.log('[SendGrid] Sending password reset email to:', email);

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.eclip.pro'}/reset-password?token=${token}`;

  const html = `
    <h1 style="color:#00ffae;margin-top:0;">Password Reset Request</h1>
    <p>Hello ${username},</p>
    <p>We received a request to reset your password for your Eclip Pro account. Click the button below to reset your password:</p>
    <div style="text-align:center;margin:30px 0;">
      <a href="${resetUrl}" 
        style="display:inline-block;background:#00ffae;color:#000;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:16px;">
        Reset Password
      </a>
    </div>
    <p style="margin-top:30px;font-size:14px;">Or copy and paste this link:</p>
    <p style="word-break:break-all;color:#00ffae;font-size:12px;">${resetUrl}</p>
    <div style="background:#ff444433;border-left:4px solid #ff4444;padding:15px;margin:30px 0;border-radius:4px;">
      <p style="margin:0;color:#ff8888;font-weight:600;">⚠️ Warning:</p>
      <p style="margin:10px 0 0 0;">This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
    </div>
  `;

  await sendEclipEmail(email, 'Reset your Eclip Pro password', html);
}

export async function sendSupportEmail(fromEmail: string, fromName: string, subject: string, message: string) {
  console.log('[SendGrid] Sending support email from:', fromEmail);

  const html = `
    <p><strong>From:</strong> ${fromName} &lt;${fromEmail}&gt;</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <div style="background:#1a1a1a;border-left:4px solid #00ffae;padding:15px;margin:20px 0;border-radius:4px;">
      ${message.replace(/\n/g, '<br>')}
    </div>
  `;

  await sendEclipEmail(
    process.env.SUPPORT_EMAIL || 'support@eclip.pro',
    `[Support] ${subject}`,
    html
  );
}

export async function sendSupportConfirmationEmail(email: string, ticketId: string) {
  console.log('[SendGrid] Sending support confirmation email to:', email);

  const html = `
    <h1 style="color:#00ffae;margin-top:0;">Support Request Received</h1>
    <p>Thank you for contacting Eclip Pro support. We've received your request and our team will get back to you as soon as possible.</p>
    <div style="background:#1a1a1a;padding:20px;border-radius:8px;text-align:center;margin:30px 0;">
      <p style="color:#999;margin:0 0 10px 0;">Your ticket ID:</p>
      <p style="font-size:24px;color:#00ffae;font-weight:bold;margin:0;">#${ticketId}</p>
    </div>
    <p>Please keep this ticket ID for your records. You'll receive a response via email shortly.</p>
  `;

  await sendEclipEmail(email, 'Support Request Received - Eclip Pro', html);
}

export async function sendNotificationEmail(email: string, title: string, message: string, type: 'match_found' | 'rank_up' | 'achievement' | 'general' = 'general') {
  console.log('[SendGrid] Sending notification email to:', email);

  const icons = {
    match_found: '🎮',
    rank_up: '🏆',
    achievement: '⭐',
    general: '📬',
  };

  const html = `
    <div style="text-align:center;font-size:48px;margin:20px 0;">
      ${icons[type]}
    </div>
    <h1 style="color:#00ffae;text-align:center;">${title}</h1>
    <p style="margin:20px 0;line-height:1.8;">
      ${message.replace(/\n/g, '<br>')}
    </p>
  `;

  await sendEclipEmail(email, title, html);
}

// Export interface for backwards compatibility
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}


