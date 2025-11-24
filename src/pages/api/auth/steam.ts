import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Placeholder Steam auth endpoint.
 * In a later phase we will implement full OpenID with Steam.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return res
    .status(501)
    .send("Steam login is not wired yet, but the button and route are ready.");
}
