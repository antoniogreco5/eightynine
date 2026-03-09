"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

interface Props {
  userName?: string;
  userImage?: string;
  onReset: () => void;
  onClear: () => void;
  onExport: () => string;
  onRefreshPrices: () => void;
  pricesLoading: boolean;
  lastPriceUpdate: Date | null;
}

export default function Header({ userName, userImage, onReset, onClear, onExport, onRefreshPrices, pricesLoading, lastPriceUpdate }: Props) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = () => {
    const text = onExport();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const timeAgo = lastPriceUpdate
    ? `${Math.round((Date.now() - lastPriceUpdate.getTime()) / 1000)}s ago`
    : null;

  return (
    <header className="border-b border-surface-300 bg-surface-50/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-cyan flex items-center justify-center text-white text-[11px] font-bold tracking-tight shadow-glow">
            89
          </div>
          <div>
            <h1 className="text-[15px] font-semibold tracking-tight">EightyNine</h1>
          </div>
        </div>

        {/* Center - Price Status */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={onRefreshPrices}
            disabled={pricesLoading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-200/60 border border-surface-300 text-xs text-surface-700 hover:text-surface-800 hover:border-surface-400 transition-all disabled:opacity-50"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${pricesLoading ? "bg-warn animate-pulse-soft" : "bg-up"}`} />
            {pricesLoading ? "Refreshing..." : timeAgo ? `Prices · ${timeAgo}` : "Refresh Prices"}
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="btn-ghost text-xs py-1.5 px-3">
            {copied ? "✓ Copied" : "Export"}
          </button>
          <button onClick={onReset} className="btn-ghost text-xs py-1.5 px-3 hidden sm:block">
            Sample Data
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-surface-200 transition-colors"
            >
              {userImage ? (
                <img src={userImage} alt="" className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-surface-400 flex items-center justify-center text-xs font-medium text-surface-800">
                  {userName?.[0] ?? "?"}
                </div>
              )}
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-surface-200 border border-surface-400 rounded-xl shadow-elevated p-1.5 z-50">
                  {userName && (
                    <div className="px-3 py-2 text-xs text-surface-700 border-b border-surface-300 mb-1">
                      {userName}
                    </div>
                  )}
                  <button
                    onClick={() => { onReset(); setShowMenu(false); }}
                    className="w-full text-left px-3 py-2 text-sm text-surface-800 hover:bg-surface-300 rounded-lg transition-colors"
                  >
                    Load Sample Data
                  </button>
                  <button
                    onClick={() => { onClear(); setShowMenu(false); }}
                    className="w-full text-left px-3 py-2 text-sm text-surface-800 hover:bg-surface-300 rounded-lg transition-colors"
                  >
                    Clear Portfolio
                  </button>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full text-left px-3 py-2 text-sm text-down hover:bg-down-dim rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
