import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DashboardPage() {
  const { data, error } = useSWR("/api/auth/me", fetcher);

  if (error) {
    return <p className="text-sm text-red-400">Failed to load profile.</p>;
  }

  if (!data) {
    return <p className="text-sm text-neutral-400">Loading profile…</p>;
  }

  if (!data.user) {
    return <p className="text-sm text-neutral-400">You are not logged in.</p>;
  }

  const user = data.user as any;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-neutral-100">Welcome, {user.username ?? user.email}</h1>
      <div className="grid gap-3 text-xs sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-black/40 p-3">
          <p className="text-neutral-400">Level</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-100">{user.level}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/40 p-3">
          <p className="text-neutral-400">Rank</p>
          <p className="mt-1 text-2xl font-semibold text-[#7BFF5A]">{user.rank}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/40 p-3">
          <p className="text-neutral-400">Coins</p>
          <p className="mt-1 text-2xl font-semibold text-[#FFD047]">{user.coins}</p>
        </div>
      </div>
    </div>
  );
}\n