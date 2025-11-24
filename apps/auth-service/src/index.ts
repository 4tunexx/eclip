import express from "express"
import session from "express-session"
import passport from "passport"
import SteamStrategy from "passport-steam"
import { Pool } from "pg"
import jwt from "jsonwebtoken"
import { EventBus } from "@eclip/shared"

const app = express()
app.use(session({ secret: process.env.SESSION_SECRET || "dev", resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const bus = new EventBus(process.env.REDIS_URL || "")

passport.use(new SteamStrategy({
  returnURL: process.env.STEAM_RETURN_URL || "http://localhost:3010/auth/steam/return",
  realm: process.env.STEAM_REALM || "http://localhost:3010/",
  apiKey: process.env.STEAM_API_KEY || ""
}, async (identifier: string, profile: any, done: any) => {
  const client = await pool.connect()
  try {
    const steamId = profile.id
    const username = profile.displayName
    const avatar = profile.photos?.[0]?.value || ""
    await client.query(
      "INSERT INTO users (steam_id, username, avatar) VALUES ($1, $2, $3) ON CONFLICT (steam_id) DO UPDATE SET username = EXCLUDED.username, avatar = EXCLUDED.avatar",
      [steamId, username, avatar]
    )
    done(null, { steamId })
  } finally {
    client.release()
  }
}))

passport.serializeUser((user: any, done) => done(null, user))
passport.deserializeUser((obj: any, done) => done(null, obj))

app.get("/health", (_req, res) => res.json({ ok: true }))
app.get("/auth/steam", passport.authenticate("steam"))
app.get("/auth/steam/return", passport.authenticate("steam", { failureRedirect: "/" }), async (req: any, res) => {
  const client = await pool.connect()
  try {
    const steamId = req.user.steamId
    const ures = await client.query("SELECT id, username FROM users WHERE steam_id = $1", [steamId])
    const userId = ures.rows[0].id
    const token = jwt.sign({ sub: userId, steamId }, process.env.JWT_SECRET || "dev", { expiresIn: "7d" })
    await bus.publish("user.login", { type: "user.login", payload: { userId }, timestamp: new Date().toISOString() })
    res.redirect(`${process.env.POST_LOGIN_REDIRECT || "http://localhost:3000/dashboard"}?token=${token}`)
  } finally {
    client.release()
  }
})

const port = Number(process.env.PORT || 3010)
app.listen(port)