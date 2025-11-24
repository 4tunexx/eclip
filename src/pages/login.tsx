import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const body = {
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      password: (form.elements.namedItem("password") as HTMLInputElement).value,
    };
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-black/60 p-5">
        <h1 className="text-lg font-semibold text-neutral-100">Login</h1>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-1 text-xs">
            <label className="text-neutral-300">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-xs outline-none focus:border-accent-primary/60"
            />
          </div>
          <div className="space-y-1 text-xs">
            <label className="text-neutral-300">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-xs outline-none focus:border-accent-primary/60"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded bg-accent-primary py-2 text-xs font-semibold text-black hover:bg-[#93FF7B] disabled:opacity-60"
          >
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>
        <div className="pt-2 border-t border-white/10 mt-3 space-y-2">
          <p className="text-[11px] text-neutral-400 text-center">Or continue with</p>
          <a
            href="/api/auth/steam"
            className="flex w-full items-center justify-center gap-2 rounded border border-[#66c0f4]/60 bg-[#1b2838] px-3 py-2 text-xs font-semibold text-[#c7d5e0] hover:bg-[#171a21] transition"
          >
            <span>Sign in with Steam</span>
          </a>
        </div>
        <p className="text-[11px] text-neutral-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-accent-primary">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
