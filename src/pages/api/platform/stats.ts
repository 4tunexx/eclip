import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Later this can query real matches/users. For now, placeholder zeros.
  res.status(200).json({
    onlinePlayers: 0,
    liveMatches: 0,
    finishedMatches: 0,
    coinsEarned: 0,
  });
}
