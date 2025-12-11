/**
 * Email Templates for Eclip Pro
 * All templates use SendGrid with the Eclip Pro branding
 */

export const EmailTemplates = {
  /**
   * Email verification template
   */
  verification: (link: string) => `
    <h1 style="color:#00ffae;">Verify Your Eclip Pro Account</h1>
    <p>Click below to verify your account and complete registration:</p>
    <a href="${link}" 
      style="display:inline-block;margin-top:20px;background:#00ffae;color:#000;padding:14px 22px;
      border-radius:6px;text-decoration:none;font-weight:600;">
      Verify Account
    </a>
    <p style="margin-top:20px;word-break:break-all;color:#888;font-size:12px;">${link}</p>
  `,

  /**
   * Password reset template
   */
  resetPassword: (link: string) => `
    <h1 style="color:#00ffae;">Reset Your Password</h1>
    <p>Click below to reset your Eclip Pro password:</p>
    <a href="${link}" 
      style="display:inline-block;margin-top:20px;background:#00ffae;color:#000;padding:14px 22px;
      border-radius:6px;text-decoration:none;font-weight:600;">
      Reset Password
    </a>
    <p style="margin-top:20px;word-break:break-all;color:#888;font-size:12px;">${link}</p>
    <p style="margin-top:20px;color:#ff6666;font-size:12px;">⚠️ This link expires in 1 hour</p>
  `,

  /**
   * Match summary template
   */
  matchSummary: (data: any) => `
    <h1 style="color:#00ffae;">Match Summary — ${data.result}</h1>
    <div style="background:#1a1a1a;padding:20px;border-radius:8px;margin:20px 0;">
      <p><strong>Score:</strong> <span style="color:#00ffae;">${data.score}</span></p>
      <p><strong>ESR Change:</strong> <span style="color:#00ffae;">${data.esr}</span></p>
      <p><strong>Coins Earned:</strong> <span style="color:#00ffae;">${data.coins}</span></p>
    </div>
  `,

  /**
   * Rank up notification
   */
  rankUp: (data: any) => `
    <h1 style="color:#00ffae;">🏆 Rank Up!</h1>
    <p>Congratulations! You've reached <strong style="color:#00ffae;">${data.newRank}</strong></p>
    <p>You're now <strong>${data.level}</strong> and earned <strong style="color:#00ffae;">${data.coins}</strong> coins!</p>
  `,

  /**
   * Achievement unlocked template
   */
  achievement: (data: any) => `
    <h1 style="color:#00ffae;">⭐ Achievement Unlocked!</h1>
    <p><strong>${data.name}</strong></p>
    <p style="color:#999;">${data.description}</p>
    <p style="margin-top:20px;">Reward: <strong style="color:#00ffae;">${data.reward} coins</strong></p>
  `,

  /**
   * Welcome email
   */
  welcome: (username: string) => `
    <h1 style="color:#00ffae;">Welcome to Eclip Pro, ${username}!</h1>
    <p>You're now part of the competitive CS2 community. Get ready to prove your skills and climb the ranks!</p>
    <div style="background:#1a1a1a;padding:20px;border-radius:8px;margin:20px 0;">
      <p><strong>Your Journey Starts Here:</strong></p>
      <ul>
        <li>Complete your profile</li>
        <li>Verify your email</li>
        <li>Find your first match</li>
        <li>Climb the ESR leaderboard</li>
      </ul>
    </div>
  `,

  /**
   * General notification template
   */
  notification: (title: string, message: string) => `
    <h1 style="color:#00ffae;">${title}</h1>
    <p>${message}</p>
  `,
};
