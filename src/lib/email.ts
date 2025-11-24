import nodemailer from "nodemailer";

const server = process.env.EMAIL_SERVER;
const from = process.env.EMAIL_FROM;

if (!server || !from) {
  console.warn("EMAIL_SERVER or EMAIL_FROM is not set. Email sending will be disabled.");
}

export async function sendMail(options: { to: string; subject: string; html: string }) {
  if (!server || !from) return;

  const url = new URL(server);
  const username = decodeURIComponent(url.username);
  const password = decodeURIComponent(url.password);
  const secure = url.port === "465";

  const transporter = nodemailer.createTransport({
    host: url.hostname,
    port: Number(url.port) || 587,
    secure,
    auth: username
      ? {
          user: username,
          pass: password,
        }
      : undefined,
  });

  await transporter.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}
