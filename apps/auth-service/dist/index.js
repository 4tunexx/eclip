"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const passport_steam_1 = __importDefault(require("passport-steam"));
const pg_1 = require("pg");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bus_1 = require("@eclip/shared/src/bus");
const app = (0, express_1.default)();
app.use((0, express_session_1.default)({ secret: process.env.SESSION_SECRET || "dev", resave: false, saveUninitialized: false }));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const bus = new bus_1.EventBus(process.env.REDIS_URL || "");
passport_1.default.use(new passport_steam_1.default({
    returnURL: process.env.STEAM_RETURN_URL || "http://localhost:3010/auth/steam/return",
    realm: process.env.STEAM_REALM || "http://localhost:3010/",
    apiKey: process.env.STEAM_API_KEY || ""
}, async (identifier, profile, done) => {
    const client = await pool.connect();
    try {
        const steamId = profile.id;
        const username = profile.displayName;
        const avatar = profile.photos?.[0]?.value || "";
        await client.query("INSERT INTO users (steam_id, username, avatar) VALUES ($1, $2, $3) ON CONFLICT (steam_id) DO UPDATE SET username = EXCLUDED.username, avatar = EXCLUDED.avatar", [steamId, username, avatar]);
        done(null, { steamId });
    }
    finally {
        client.release();
    }
}));
passport_1.default.serializeUser((user, done) => done(null, user));
passport_1.default.deserializeUser((obj, done) => done(null, obj));
app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/auth/steam", passport_1.default.authenticate("steam"));
app.get("/auth/steam/return", passport_1.default.authenticate("steam", { failureRedirect: "/" }), async (req, res) => {
    const client = await pool.connect();
    try {
        const steamId = req.user.steamId;
        const ures = await client.query("SELECT id, username FROM users WHERE steam_id = $1", [steamId]);
        const userId = ures.rows[0].id;
        const token = jsonwebtoken_1.default.sign({ sub: userId, steamId }, process.env.JWT_SECRET || "dev", { expiresIn: "7d" });
        await bus.publish("user.login", { type: "user.login", payload: { userId }, timestamp: new Date().toISOString() });
        res.redirect(`${process.env.POST_LOGIN_REDIRECT || "http://localhost:3000/dashboard"}?token=${token}`);
    }
    finally {
        client.release();
    }
});
const port = Number(process.env.PORT || 3010);
app.listen(port);
//# sourceMappingURL=index.js.map