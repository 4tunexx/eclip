"use client"
import { motion } from "framer-motion"
import Link from "next/link"

const profileStats = [
  { label: "ELO", value: "3,482", delta: "+120", color: "text-neonLime" },
  { label: "Win Rate", value: "68%", delta: "+4%", color: "text-electricGreen" },
  { label: "Headshot", value: "47%", delta: "+6%", color: "text-white" }
]

const recentMatches = [
  { id: "#3821", result: "Win", map: "Mirage", score: "13-6", rating: "+24", kda: "21/9/4" },
  { id: "#3816", result: "Loss", map: "Nuke", score: "9-13", rating: "-12", kda: "17/15/3" },
  { id: "#3814", result: "Win", map: "Anubis", score: "13-11", rating: "+15", kda: "24/18/2" }
]

const rewards = [
  { label: "Neon Coins", value: "4.70", sub: "+0.10 today" },
  { label: "Trophies", value: "12", sub: "3 legendary" },
  { label: "Achievements", value: "28", sub: "2 new" }
]

const queueStates = [
  { ladder: "5v5 Premier", status: "In Queue", eta: "00:38", priority: "Prime Matched" },
  { ladder: "1v1 Duel", status: "Ready", eta: "00:05", priority: "Express" }
]

export default function Dashboard() {
  return (
    <div className="space-y-10 pb-16">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-black/70 via-darkCyberGrey/60 to-circuitBlue/30 p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-white/50">Synced via Steam</p>
            <h1 className="mt-2 text-3xl font-black text-white">LYNX//AURORA</h1>
            <p className="text-white/60">Europe West | Premier Division | Neon Rank VII</p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/70">
              <span className="rounded-full border border-white/20 px-4 py-1">Streak: 4W</span>
              <span className="rounded-full border border-white/20 px-4 py-1">MMR Sync Enabled</span>
              <span className="rounded-full border border-white/20 px-4 py-1">Anti-cheat Clean</span>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/40 p-6 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">Wallet</p>
            <p className="mt-3 text-4xl font-black text-neonLime">4.70</p>
            <p className="text-sm text-white/60">Neon coins available</p>
            <Link
              href="/api/rewards/claim"
              className="mt-4 inline-flex items-center justify-center rounded-full border border-neonLime/60 px-6 py-2 text-sm font-semibold text-neonLime transition hover:bg-neonLime/10"
            >
              Claim Rewards
            </Link>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {profileStats.map(card => (
            <div key={card.label} className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">{card.label}</p>
              <p className={`mt-3 text-3xl font-bold ${card.color}`}>{card.value}</p>
              <p className="text-sm text-white/60">Last 24h {card.delta}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">Queue Control</p>
              <h2 className="text-2xl font-semibold text-white">Matchmaking Status</h2>
            </div>
            <Link href="/api/auth/steam" className="rounded-full border border-white/20 px-5 py-2 text-sm text-white/80 hover:border-neonLime">
              Edit Preferences
            </Link>
          </div>
          <div className="mt-5 space-y-4">
            {queueStates.map(state => (
              <div key={state.ladder} className="rounded-2xl border border-white/10 bg-darkCyberGrey/70 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{state.ladder}</p>
                    <p className="text-xs text-white/50">{state.priority}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/50">ETA</p>
                    <p className="text-2xl font-black text-neonLime">{state.eta}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs uppercase tracking-[0.3em]">
                  <span className={state.status === "In Queue" ? "text-electricGreen" : "text-neonLime"}>{state.status}</span>
                  <button className="rounded-full border border-white/20 px-4 py-1 text-white/70 hover:border-neonLime">
                    {state.status === "In Queue" ? "Leave" : "Join"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-circuitBlue/40 to-black/40 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-white/40">Rewards</p>
          <h2 className="text-2xl font-semibold text-white">Progress & Economy</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {rewards.map(reward => (
              <div key={reward.label} className="rounded-2xl border border-white/10 bg-black/30 p-4 text-center">
                <p className="text-sm text-white/60">{reward.label}</p>
                <p className="mt-2 text-2xl font-bold text-neonLime">{reward.value}</p>
                <p className="text-xs text-white/50">{reward.sub}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-darkCyberGrey/70 p-5">
            <p className="text-sm font-semibold text-white">Weekly Quest</p>
            <p className="text-xs text-white/60">Win 5 matches without abandoning</p>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-neonLime" style={{ width: "60%" }} />
            </div>
            <p className="mt-2 text-xs text-white/60">3 / 5 complete</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-black/50 p-6">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">Match History</p>
            <h2 className="text-2xl font-semibold text-white">Last Deployments</h2>
          </div>
          <button className="w-full rounded-full border border-white/20 px-5 py-2 text-sm text-white/70 hover:border-neonLime md:w-auto">
            Download Demo Logs
          </button>
        </div>
        <div className="mt-5 space-y-4">
          {recentMatches.map(match => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-darkCyberGrey/70 p-4"
            >
              <div>
                <p className="text-sm font-semibold text-white">{match.id}</p>
                <p className="text-xs text-white/60">{match.map}</p>
              </div>
              <div className="text-sm text-white/70">
                <p>{match.kda}</p>
                <p>{match.score}</p>
              </div>
              <div className="text-right">
                <p className={match.result === "Win" ? "text-neonLime" : "text-electricGreen"}>{match.result}</p>
                <p className="text-xs text-white/60">Rating {match.rating}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
