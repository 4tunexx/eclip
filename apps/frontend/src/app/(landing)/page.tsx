import Link from "next/link";

export default function LandingPage() {
  // In a real app, you would fetch these stats from /api/public/metrics
  return (
    <div className="flex min-h-screen flex-col items-center justify-between px-4 py-6">
      <div className="w-full max-w-4xl space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md border border-[#7BFF5A]/40 bg-gradient-to-br from-[#7BFF5A]/50 to-[#00FFB3]/20" />
            <div className="text-xl font-semibold tracking-wide">
              <span className="text-[#7BFF5A]">Eclip</span>
              <span className="text-neutral-300">.pro</span>
            </div>
          </div>
        </div>

        {/* Banner with login/register */}
        <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#020617] via-[#020A04] to-[#020617] p-6 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
          <div className="space-y-4 text-center">
            <h1 className="text-3xl font-semibold text-neutral-100 sm:text-4xl">
              The CS2 competitive layer built for grinders.
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-neutral-400">
              Queue into ranked, climb custom Eclip ranks, earn coins, unlock cosmetics,
              and flex your public profile. Built around Steam, stats, and real progression.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/login"
                className="rounded-lg bg-[#7BFF5A] px-5 py-2 text-sm font-semibold text-black shadow-[0_0_25px_rgba(123,255,90,0.7)] hover:bg-[#93FF7B] transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg border border-white/15 bg-white/5 px-5 py-2 text-sm font-semibold text-neutral-100 hover:border-[#7BFF5A]/60 transition"
              >
                Register
              </Link>
            </div>
          </div>
        </section>

        {/* Stats preview */}
        <section className="grid gap-3 text-xs sm:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-black/40 p-3">
            <p className="text-neutral-400">Players online</p>
            <p className="mt-1 text-2xl font-semibold text-neutral-100">–</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/40 p-3">
            <p className="text-neutral-400">Matches live</p>
            <p className="mt-1 text-2xl font-semibold text-neutral-100">–</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/40 p-3">
            <p className="text-neutral-400">Matches finished</p>
            <p className="mt-1 text-2xl font-semibold text-neutral-100">–</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/40 p-3">
            <p className="text-neutral-400">Coins earned</p>
            <p className="mt-1 text-2xl font-semibold text-[#FFD047]">–</p>
          </div>
        </section>

        {/* Top players preview (will later use /api/leaderboards/top5) */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-neutral-100">
            Top players today
          </h2>
          <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-neutral-400">
            Leaderboard preview will appear here once the backend is wired and players
            start grinding matches.
          </div>
        </section>
      </div>

      <footer className="mt-8 w-full border-t border-white/10 py-4 text-center text-[11px] text-neutral-500">
        © {new Date().getFullYear()} Eclip.pro – Dominate • Win • Compete • Play • Enjoy
      </footer>
    </div>
  );
}
