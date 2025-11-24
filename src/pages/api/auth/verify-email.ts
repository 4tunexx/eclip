import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.query.token;
  if (!token || typeof token !== "string") {
    return res.status(400).send("Invalid token");
  }

  const record = await prisma.emailVerificationToken.findUnique({ where: { token } });
  if (!record) {
    return res.status(400).send("Invalid or expired token");
  }

  if (record.expiresAt < new Date()) {
    return res.status(400).send("Token expired");
  }

  await prisma.emailVerificationToken.delete({ where: { id: record.id } });

  return res.status(200).send("Email verified. You can close this page.");
}