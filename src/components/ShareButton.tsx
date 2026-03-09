"use client";

import { useState } from "react";
import { Holding } from "@/lib/types";

interface Props {
  holdings: Holding[];
}

export default function ShareButton({ holdings }: Props) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateLink = async () => {
    if (holdings.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolioData: holdings }),
      });
      const data = await res.json();
      if (data.token) {
        const url = `${window.location.origin}/share/${data.token}`;
        setShareUrl(url);
        navigator.clipboard.writeText(url).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        });
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  if (shareUrl) {
    return (
      <div className="flex items-center gap-2">
        <input value={shareUrl} readOnly className="input text-xs !py-1.5 !w-56 truncate" onClick={(e) => (e.target as HTMLInputElement).select()} />
        <button
          onClick={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="btn-ghost text-xs !py-1.5"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
    );
  }

  return (
    <button onClick={generateLink} disabled={loading || holdings.length === 0} className="btn-ghost text-xs !py-1.5">
      {loading ? "Generating..." : "Share Portfolio"}
    </button>
  );
}
