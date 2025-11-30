import nodemailer from 'nodemailer';
import { config } from './config';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: 'send.one.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  if (!config.email.password || !config.email.user) {
    console.warn('Email credentials not configured, skipping send');
    return;
  }

  try {
    await transporter.sendMail({
      from: config.email.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function sendVerificationEmail(email: string, token: string, username: string) {
  const verificationUrl = `${config.api.baseUrl}/api/auth/verify-email?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #39FF14 0%, #BF00FF 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #222; padding: 30px; color: #fff; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #39FF14; color: #000; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #fff; margin: 0;">Eclip.pro</h1>
          </div>
          <div class="content">
            <h2>Welcome, ${username}!</h2>
            <p>Thank you for registering on Eclip.pro. To complete your registration, please verify your email address by clicking the button below:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #39FF14;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account on Eclip.pro, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2025 Eclip.pro. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Verify your Eclip.pro email address',
    html,
  });
}

export async function sendPasswordResetEmail(email: string, token: string, username: string) {
  const resetUrl = `${config.api.baseUrl}/reset-password?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #39FF14 0%, #BF00FF 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #222; padding: 30px; color: #fff; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #39FF14; color: #000; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
          .warning { background: #ff4444; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #fff; margin: 0;">Eclip.pro</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello ${username},</p>
            <p>We received a request to reset your password for your Eclip.pro account. Click the button below to reset your password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #39FF14;">${resetUrl}</p>
            <div class="warning">
              <p><strong>Warning:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 Eclip.pro. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Reset your Eclip.pro password',
    html,
  });
}

export async function sendSupportEmail(fromEmail: string, fromName: string, subject: string, message: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #222; padding: 20px; color: #39FF14; }
          .content { background: #f5f5f5; padding: 30px; }
          .message { background: #fff; padding: 20px; border-left: 4px solid #39FF14; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Support Request</h1>
          </div>
          <div class="content">
            <p><strong>From:</strong> ${fromName} (${fromEmail})</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <div class="message">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  // Send to support email (could be configurable)
  await sendEmail({
    to: process.env.SUPPORT_EMAIL || 'support@eclip.pro',
    subject: `[Support] ${subject}`,
    html,
  });
}

export async function sendSupportConfirmationEmail(email: string, ticketId: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #39FF14 0%, #BF00FF 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #222; padding: 30px; color: #fff; border-radius: 0 0 10px 10px; }
          .ticket { background: #333; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; }
          .ticket-id { font-size: 24px; color: #39FF14; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #fff; margin: 0;">Eclip.pro Support</h1>
          </div>
          <div class="content">
            <h2>Support Request Received</h2>
            <p>Thank you for contacting Eclip.pro support. We've received your request and our team will get back to you as soon as possible.</p>
            <div class="ticket">
              <p>Your ticket ID:</p>
              <p class="ticket-id">#${ticketId}</p>
            </div>
            <p>Please keep this ticket ID for your records. You'll receive a response via email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Support Request Received - Eclip.pro',
    html,
  });
}

export async function sendNotificationEmail(email: string, title: string, message: string, type: 'match_found' | 'rank_up' | 'achievement' | 'general' = 'general') {
  const icons = {
    match_found: '🎮',
    rank_up: '🏆',
    achievement: '⭐',
    general: '📬',
  };

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #39FF14 0%, #BF00FF 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #222; padding: 30px; color: #fff; border-radius: 0 0 10px 10px; }
          .icon { font-size: 48px; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #fff; margin: 0;">Eclip.pro</h1>
          </div>
          <div class="content">
            <div class="icon">${icons[type]}</div>
            <h2>${title}</h2>
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: title,
    html,
  });
}

