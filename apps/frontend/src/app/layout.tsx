import "./globals.css"
import Link from "next/link"
import { ReactNode } from "react"

const nav = [
  { href: "/", label: "Home" },
  { href: "/leaderboards", label: "Leaderboards" },
  { href: "/dashboard", label: "Dashboard" }
]

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-darkCyberGrey text-white">
        <div className="relative isolate overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(198,255,50,.18),_transparent_60%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-circuitBlue/40 via-black/60 to-darkCyberGrey" />
          <div className="relative z-10 min-h-screen flex flex-col">
            <header className="border-b border-white/10 backdrop-blur-sm bg-darkCyberGrey/60">
              <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                <Link href="/" className="text-2xl font-black tracking-[0.4em] text-neonLime">
                  ECLIP.PRO
                </Link>
                <nav className="flex items-center gap-3 text-sm font-medium">
                  {nav.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="px-4 py-2 rounded-full border border-white/20 text-white/80 transition hover:text-neonLime hover:border-neonLime/70"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Link
                    href="/api/auth/steam"
                    className="ml-2 rounded-full bg-electricGreen px-5 py-2 text-darkCyberGrey font-semibold shadow-[0_0_20px_rgba(127,255,0,.5)] transition hover:scale-[1.02]"
                  >
                    Steam Login
                  </Link>
                </nav>
              </div>
            </header>
            <main className="flex-1">
              <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
