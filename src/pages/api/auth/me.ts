import type { NextApiRequest, NextApiResponse } from "next";
import { getUserFromRequest } from "../../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromRequest(req);
  return res.status(200).json({ user });
}