import "../globals.css";
import type { ReactNode } from "react";

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#05060A] text-[#E5E5E5] antialiased">
        {children}
      </body>
    </html>
  );
}
