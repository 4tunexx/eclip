import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between px-4 py-6">
      <div className="w-full max-w-4xl space-y-8">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md border border-[#7BFF5A]/40 bg-gradient-to-br from-[#7BFF5A]/50 to-[#00FFB3]/20" />
            <div className="text-xl font-semibold tracking-wide">
              <span className="text-[#7BFF5A]">Eclip</span>
              <span className="text-neutral-300">.pro</span>
            </div>
          </div>
        </div>
        <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#020617] via-[#020A04] to-[#020617] p-6 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
          <div className="space-y-4 text-center">
            <h1 className="text-3xl font-semibold text-neutral-100 sm:text-4xl">
              The CS2 competitive layer built for grinders.
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-neutral-400">
              Queue into ranked, climb custom Eclip ranks, earn coins, unlock cosmetics,
              and flex your public profile.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/login" className="rounded-lg bg-[#7BFF5A] px-5 py-2 text-sm font-semibold text-black shadow-[0_0_25px_rgba(123,255,90,0.7)] hover:bg-[#93FF7B] transition">
                Login
              </Link>
              <Link href="/register" className="rounded-lg border border-white/15 bg-white/5 px-5 py-2 text-sm font-semibold text-neutral-100 hover:border-[#7BFF5A]/60 transition">
                Register
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
