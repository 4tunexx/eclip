import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/db";
import { signUserToken, setAuthCookie } from "../../../lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(400).json({ error: "Invalid email or password" });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).json({ error: "Invalid email or password" });
  }

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

  return res.status(200).json({ user: authUser });
}\n