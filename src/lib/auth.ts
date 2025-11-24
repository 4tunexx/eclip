import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { prisma } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export type AuthUser = {
  id: string;
  email: string;
  username: string | null;
  coins: number;
  level: number;
  rank: string;
};

export function signUserToken(user: AuthUser) {
  return jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "7d" });
}

export async function getUserFromRequest(req: NextApiRequest): Promise<AuthUser | null> {
  try {
    const cookie = req.headers.cookie ?? "";
    const match = cookie.match(/eclip_token=([^;]+)/);
    if (!match) return null;
    const token = match[1];
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      coins: user.coins,
      level: user.level,
      rank: user.rank,
    };
  } catch {
    return null;
  }
}

export function setAuthCookie(res: NextApiResponse, token: string) {
  const isProd = process.env.NODE_ENV === "production";
  res.setHeader("Set-Cookie", [
    `eclip_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${
      isProd ? "; Secure" : ""
    }`,
  ]);
}

export function clearAuthCookie(res: NextApiResponse) {
  const isProd = process.env.NODE_ENV === "production";
  res.setHeader(
    "Set-Cookie",
    `eclip_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isProd ? "; Secure" : ""}`,
  );
}\n