"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) router.push("/dashboard");
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-ambient-landing bg-grid flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-cyan animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ambient-landing bg-grid relative overflow-hidden">
      {/* Floating orbs for depth */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-brand-400/[0.03] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-cyan/[0.03] blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-16">
        {/* Header */}
        <nav className="flex items-center justify-between mb-32 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-cyan flex items-center justify-center text-white text-xs font-bold tracking-tight shadow-glow">
              89
            </div>
            <span className="text-lg font-semibold tracking-tight">EightyNine</span>
          </div>
          <button
            onClick={() => signIn("google")}
            className="btn-ghost text-sm"
          >
            Sign In
          </button>
        </nav>

        {/* Hero */}
        <div className="max-w-2xl animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-surface-400 bg-surface-200/50 text-xs font-medium text-surface-700 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-up animate-pulse-soft" />
            Portfolio diversification, visualized
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
            Know your portfolio.
            <br />
            <span className="text-gradient">Own your risk.</span>
          </h1>

          <p className="text-lg text-surface-700 leading-relaxed max-w-lg mb-10">
            EightyNine checks every position against the 5/20 diversification rule — no stock over 5%, no sector over 20%. Live prices, smart recommendations, instant trade simulation.
          </p>

          <button
            onClick={() => signIn("google")}
            className="group flex items-center gap-3 btn-primary text-base px-8 py-4 rounded-2xl"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
            <span className="text-white/50 group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-32 animate-slide-up stagger-3">
          {[
            { icon: "◎", title: "5/20 Rule Engine", desc: "No stock over 5%. No sector over 20%. Real-time compliance checks across your entire book." },
            { icon: "⧫", title: "Trade Simulator", desc: "Test any trade before you make it. See exactly how it impacts your position and sector weights." },
            { icon: "↗", title: "Live Prices", desc: "Powered by Finnhub. Auto-refreshing market data keeps your analysis current." },
          ].map((f) => (
            <div key={f.title} className="card p-6 group">
              <div className="text-2xl mb-4 text-brand-400 opacity-70 group-hover:opacity-100 transition-opacity">
                {f.icon}
              </div>
              <h3 className="text-sm font-semibold mb-2 text-surface-900">{f.title}</h3>
              <p className="text-sm text-surface-700 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-32 pt-8 border-t border-surface-300">
          <p className="text-xs text-surface-600">
            EightyNine is a portfolio analysis tool for informational purposes only. Not financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}
