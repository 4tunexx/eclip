import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    onlinePlayers: 0,
    liveMatches: 0,
    finishedMatches: 0,
    coinsEarned: 0,
  });
}\n