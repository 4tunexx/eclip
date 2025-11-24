import type { AppProps } from "next/app";
import "../styles/globals.css";
import Link from "next/link";
import { useRouter } from "next/router";

const LANDING_ROUTES = ["/", "/login", "/register"];

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isLanding = LANDING_ROUTES.includes(router.pathname);

  if (isLanding) {
    return (
      <div className="min-h-screen bg-bg text-[#E5E5E5]">
        <Component {...pageProps} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-[#E5E5E5]">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r border-white/10 bg-black/40 p-4 md:flex">
          <div className="mb-6 flex items-center gap-2">
            <div className="h-8 w-8 rounded-md border border-accent-primary/40 bg-gradient-to-br from-accent-primary/50 to-accent-secondary/20" />
            <div className="text-sm font-semibold tracking-wide">
              <span className="text-accent-primary">Eclip</span>
              <span className="text-neutral-300">.pro</span>
            </div>
          </div>
          <nav className="flex flex-1 flex-col gap-2 text-sm text-neutral-300">
            <Link href="/dashboard" className="rounded px-2 py-1 hover:bg-white/5">
              Dashboard
            </Link>
            <Link href="/leaderboards" className="rounded px-2 py-1 hover:bg-white/5">
              Leaderboards
            </Link>
            <Link href="/shop" className="rounded px-2 py-1 hover:bg-white/5">
              Shop
            </Link>
            <Link href="/forum" className="rounded px-2 py-1 hover:bg-white/5">
              Forum
            </Link>
            <Link href="/chat" className="rounded px-2 py-1 hover:bg-white/5">
              Chat
            </Link>
            <Link href="/settings" className="rounded px-2 py-1 hover:bg-white/5">
              Settings
            </Link>
            <Link href="/admin" className="mt-auto rounded px-2 py-1 text-xs text-red-300 hover:bg-white/5">
              Admin
            </Link>
          </nav>
        </aside>
        <main className="flex-1 px-4 py-6">
          <Component {...pageProps} />
        </main>
      </div>
    </div>
  );
}
