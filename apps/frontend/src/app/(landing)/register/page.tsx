export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-black/50 p-5">
        <h1 className="text-lg font-semibold text-neutral-100">Register</h1>
        <p className="text-xs text-neutral-400">
          Create an account with email and then link your Steam. You&apos;ll need both
          a verified email and Steam to play ranked on Eclip.pro.
        </p>
        <form className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-md border border-white/15 bg-black/60 px-3 py-2 text-xs outline-none focus:border-[#7BFF5A]"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-md border border-white/15 bg-black/60 px-3 py-2 text-xs outline-none focus:border-[#7BFF5A]"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-[#7BFF5A] px-3 py-2 text-xs font-semibold text-black hover:bg-[#93FF7B]"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
