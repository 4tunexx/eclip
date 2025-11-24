import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function RegisterPage() {
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
      username: (form.elements.namedItem("username") as HTMLInputElement).value,
    };
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Registration failed");
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-black/50 p-5">
        <h1 className="text-lg font-semibold text-neutral-100">Register</h1>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-1 text-xs">
            <label className="text-neutral-300">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-xs outline-none focus:border-[#7BFF5A]/60"
            />
          </div>
          <div className="space-y-1 text-xs">
            <label className="text-neutral-300">Username</label>
            <input
              name="username"
              type="text"
              required
              className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-xs outline-none focus:border-[#7BFF5A]/60"
            />
          </div>
          <div className="space-y-1 text-xs">
            <label className="text-neutral-300">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-xs outline-none focus:border-[#7BFF5A]/60"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded bg-[#7BFF5A] py-2 text-xs font-semibold text-black hover:bg-[#93FF7B] disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="text-[11px] text-neutral-400">
          Already have an account?{" "}
          <Link href="/login" className="text-[#7BFF5A]">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}\n