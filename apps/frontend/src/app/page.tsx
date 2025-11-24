"use client"
import Link from "next/link"
import { motion } from "framer-motion"

const features = [
  {
    title: "Matchmaking Engine",
    description: "Latency-aware queueing, instant CS2 server spins, and smurf detection baked in.",
    accent: "Neon ladders. Zero downtime."
  },
  {
    title: "Live Anticheat Feed",
    description: "Secure telemetry ingestion with moderator escalation pipelines and auto-flags.",
    accent: "Trust the lobby."
  },
  {
    title: "Cyber Profiles",
    description: "Animated rank plates, holographic achievements, and lifetime Neon coins.",
    accent: "Flex your glow."
  }
]

const queues = [
  { label: "5v5 Premier", eta: "00:42", players: 382, streak: "+18%", color: "from-neonLime/30 via-electricGreen/20" },
  { label: "1v1 Duel", eta: "00:12", players: 144, streak: "+24%", color: "from-circuitBlue/40 via-electricGreen/10" },
  { label: "Verified Teams", eta: "02:05", players: 26, streak: "+05%", color: "from-electricGreen/20 via-circuitBlue/20" }
]

const timeline = [
  { phase: "Queue", detail: "Steam auth only. MMR-calibrated entry.", glow: "text-neonLime" },
  { phase: "Server Spawn", detail: "GCP VM boots with CS2 config + anti cheat hook.", glow: "text-electricGreen" },
  { phase: "Match Pulse", detail: "Per-round stats streamed to dashboards + leaderboards.", glow: "text-circuitBlue" },
  { phase: "Rewards", detail: "+0.1 Neon coins per win, trophies, and ELO sync.", glow: "text-white" }
]

export default function Home() {
  return (
    <div className="space-y-14 pb-16">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="rounded-3xl border border-white/10 bg-gradient-to-br from-black/50 via-darkCyberGrey/60 to-circuitBlue/20 p-10 shadow-[0_0_100px_rgba(12,255,125,.12)]"
        >
          <p className="text-sm uppercase tracking-[0.4em] text-white/50">CS2 Competitive Realm</p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-white sm:text-5xl">
            Neon-fused <span className="text-neonLime">matchmaking</span> with automated{" "}
            <span className="text-electricGreen">CS2 servers</span>.
          </h1>
          <p className="mt-5 text-lg text-white/70">
            Secure Steam login, anti-cheat ingestion, live leaderboards, and rewards minted on every match. Queue up,
            drop in, and let Eclip orchestrate the arena.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/api/auth/steam"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-electricGreen px-8 py-3 text-base font-semibold text-darkCyberGrey shadow-[0_0_35px_rgba(127,255,0,.45)] transition hover:scale-[1.02]"
            >
              <span className="absolute inset-0 translate-y-[120%] bg-white/30 transition-all duration-500 group-hover:translate-y-0" />
              <span className="relative">Login with Steam</span>
            </Link>
            <Link
              href="/leaderboards"
              className="rounded-full border border-white/30 px-8 py-3 text-base font-semibold text-white/80 transition hover:border-neonLime hover:text-neonLime"
            >
              Explore Leaderboards
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-6 text-center text-sm uppercase text-white/60">
            <div>
              <div className="text-3xl font-black text-neonLime">42k</div>
              Active challengers
            </div>
            <div>
              <div className="text-3xl font-black text-electricGreen">1.2M</div>
              Matches resolved
            </div>
            <div>
              <div className="text-3xl font-black text-white">18</div>
              GCP regions
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-4 rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">Live Queue</p>
          <div className="space-y-4">
            {queues.map(queue => (
              <div
                key={queue.label}
                className={`rounded-2xl border border-white/10 bg-gradient-to-r ${queue.color} to-transparent p-5 shadow-inner`}
              >
                <div className="flex items-center justify-between text-white/80">
                  <div>
                    <p className="text-lg font-semibold">{queue.label}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">Players {queue.players}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/60">ETA</p>
                    <p className="text-2xl font-black text-neonLime">{queue.eta}</p>
                    <p className="text-xs text-electricGreen">{queue.streak} demand</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/api/auth/steam"
            className="block rounded-2xl border border-neonLime/60 bg-neonLime/10 py-3 text-center font-semibold text-neonLime transition hover:bg-neonLime hover:text-darkCyberGrey"
          >
            Join Queue
          </Link>
        </motion.div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {features.map((feature, idx) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx }}
            className="rounded-2xl border border-white/10 bg-darkCyberGrey/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,.35)]"
          >
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">Module</p>
            <h3 className="mt-3 text-xl font-semibold text-white">{feature.title}</h3>
            <p className="mt-2 text-sm text-white/60">{feature.description}</p>
            <p className="mt-4 text-sm font-semibold text-neonLime">{feature.accent}</p>
          </motion.div>
        ))}
      </section>

      <section className="rounded-3xl border border-white/10 bg-black/40 p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-white/40">Pipeline</p>
            <h2 className="text-2xl font-bold text-white">How Eclip orchestrates every match</h2>
          </div>
          <Link href="/dashboard" className="rounded-full border border-white/20 px-5 py-2 text-sm text-white/80 hover:border-neonLime">
            View Player Experience
          </Link>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-4">
          {timeline.map(item => (
            <div key={item.phase} className="rounded-2xl border border-white/10 bg-darkCyberGrey/70 p-5">
              <p className={`text-sm font-semibold uppercase tracking-[0.3em] ${item.glow}`}>{item.phase}</p>
              <p className="mt-2 text-sm text-white/70">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-circuitBlue/40 to-darkCyberGrey/60 p-6">
          <h3 className="text-xl font-semibold text-white">Neon Rewards Economy</h3>
          <p className="mt-2 text-sm text-white/70">
            Win a match, earn 0.1 Neon coins. Lose, still earn 0.01. Stack streak multipliers, cash out rewards, and
            flex animated badges on your cyber profile.
          </p>
          <div className="mt-6 grid gap-3 text-sm text-white/70">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
              <span>Win reward</span>
              <span className="text-neonLime font-semibold">+0.10 coins</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
              <span>Loss reward</span>
              <span className="text-electricGreen font-semibold">+0.01 coins</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
              <span>Streak bonus</span>
              <span className="text-white font-semibold">Up to 3x</span>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
          <h3 className="text-xl font-semibold text-white">Pulse Feed</h3>
          <p className="text-sm text-white/60">Live telemetry from provisioned CS2 servers.</p>
          <div className="mt-5 space-y-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-2xl border border-white/10 bg-darkCyberGrey/70 p-4">
                <div>
                  <p className="text-sm font-semibold text-neonLime">Match #{3821 + idx}</p>
                  <p className="text-xs text-white/60">Server spin ready • eu-west • 128 tick</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold text-white">{idx % 2 === 0 ? "Starting" : "Reporting"}</p>
                  <p className="text-electricGreen">{idx % 2 === 0 ? "VM boot" : "Stats stream"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
