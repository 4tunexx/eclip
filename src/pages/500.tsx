export default function ErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#05060A] text-[#E5E5E5]">
      <h1 className="mb-2 text-2xl font-semibold">500 – Server error</h1>
      <p className="text-sm text-neutral-400">
        Something went wrong while rendering this page.
      </p>
    </div>
  );
}