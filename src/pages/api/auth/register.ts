import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/db";
import { sendMail } from "../../../lib/email";
import { signUserToken, setAuthCookie } from "../../../lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(2).max(32),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const { email, password, username } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(400).json({ error: "Email already in use" });
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hash,
      username,
    },
  });

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
  await prisma.emailVerificationToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  const base =
    process.env.EMAIL_VERIFY_URL ||
    `${process.env.API_BASE_URL || ""}/api/auth/verify-email`;

  const verifyUrl = `${base}?token=${token}`;

  await sendMail({
    to: email,
    subject: "Verify your Eclip.pro account",
    html: `<p>Welcome to Eclip.pro!</p>
<p>Click the link below to verify your email:</p>
<p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
  });

  const authUser = {
    id: user.id,
    email: user.email,
    username: user.username,
    coins: user.coins,
    level: user.level,
    rank: user.rank,
  };
  const jwt = signUserToken(authUser);
  setAuthCookie(res, jwt);

  return res.status(201).json({ user: authUser });
}