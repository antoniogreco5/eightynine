"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { computeAllHoldings, computeSectors, computeSummary, calcTotalValue } from "@/lib/calculations";
import { runAllRules } from "@/lib/rules";
import { DEFAULT_RULES } from "@/lib/config";
import { Holding, ComputedHolding, SectorSummary, PortfolioSummary, Violation } from "@/lib/types";

export default function SharedReportPage() {
  const params = useParams();
  const [data, setData] = useState<{
    holdings: Holding[];
    userName: string;
    createdAt: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/share/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 410 ? "This report has expired." : "Report not found.");
        return res.json();
      })
      .then((d) => setData({ holdings: d.portfolioData, userName: d.userName, createdAt: d.createdAt }))
      .catch((e) => setError(e.message));
  }, [params.id]);

  if (error) {
    return (
      <div className="min-h-screen bg-ambient bg-grid flex items-center justify-center">
        <div className="card p-12 text-center max-w-md">
          <p className="text-down text-lg font-semibold mb-2">Oops</p>
          <p className="text-surface-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-ambient bg-grid flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-cyan animate-pulse" />
      </div>
    );
  }

  const rules = DEFAULT_RULES;
  const tv = calcTotalValue(data.holdings);
  const computed: ComputedHolding[] = computeAllHoldings(data.holdings, rules);
  const sectors: SectorSummary[] = computeSectors(computed, tv, rules);
  const summary: PortfolioSummary = computeSummary(computed, sectors, tv);
  const violations: Violation[] = runAllRules(computed, sectors, rules);
  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <div className="min-h-screen bg-ambient bg-grid">
      <header className="border-b border-surface-300 bg-surface-50/80 backdrop-blur-xl">
        <div className="max-w-[1000px] mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-cyan flex items-center justify-center text-white text-[11px] font-bold">89</div>
            <span className="text-[15px] font-semibold">EightyNine</span>
          </div>
          <span className="text-xs text-surface-600">
            Shared by {data.userName} · {new Date(data.createdAt).toLocaleDateString()}
          </span>
        </div>
      </header>

      <main className="max-w-[1000px] mx-auto px-5 py-8 relative z-10">
        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Portfolio Value", value: fmt(summary.totalValue) },
            { label: "Holdings", value: String(summary.holdingCount) },
            { label: "Violations", value: String(summary.violationCount), color: summary.violationCount > 0 ? "text-down" : "text-up" },
            { label: "Score", value: `${summary.concentrationScore}/100`, color: summary.concentrationScore >= 70 ? "text-up" : "text-warn" },
          ].map((c) => (
            <div key={c.label} className="card p-4">
              <p className="label mb-2">{c.label}</p>
              <p className={`text-xl font-bold tabular-nums ${c.color ?? ""}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Violations */}
        {violations.length > 0 && (
          <div className="rounded-2xl border border-down/20 bg-down-dim p-5 mb-8">
            <p className="text-sm font-semibold text-down mb-2">{violations.length} Violation{violations.length !== 1 ? "s" : ""}</p>
            {violations.map((v, i) => (
              <p key={i} className="text-sm text-surface-700 mb-1">
                <span className="font-semibold text-surface-900">{v.label}</span> is {v.currentWeight.toFixed(1)}% — over the {v.limit}% {v.type} limit by {v.overage.toFixed(1)}%
              </p>
            ))}
          </div>
        )}

        {/* Sectors */}
        <div className="card p-6 mb-8">
          <h2 className="text-sm font-semibold mb-5">Sector Allocation</h2>
          <div className="space-y-3">
            {sectors.map((s) => (
              <div key={s.name} className="flex items-center gap-4">
                <span className="text-sm font-medium w-40 truncate">{s.name}</span>
                <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min((s.weight / Math.max(...sectors.map((x) => x.weight))) * 100, 100)}%`,
                      background: s.status === "above-limit" ? "linear-gradient(90deg,#f87171,#ef4444)" : "linear-gradient(90deg,#4f8fff,#0dd4ce)",
                    }}
                  />
                </div>
                <span className={`text-sm font-semibold tabular-nums w-14 text-right ${s.status === "above-limit" ? "text-down" : ""}`}>
                  {s.weight.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Holdings */}
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-300">
                {["Ticker", "Shares", "Price", "Value", "Weight", "Sector"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left label !mb-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {computed.map((h) => (
                <tr key={h.id} className="border-b border-surface-300/50">
                  <td className="px-4 py-3 font-semibold font-mono">{h.ticker}</td>
                  <td className="px-4 py-3 tabular-nums">{h.shares}</td>
                  <td className="px-4 py-3 tabular-nums text-surface-700">{fmt(h.currentPrice)}</td>
                  <td className="px-4 py-3 tabular-nums font-medium">{fmt(h.marketValue)}</td>
                  <td className="px-4 py-3 tabular-nums font-semibold">{h.weight.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-surface-600 text-xs">{h.sector}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-surface-600 text-center mt-8">
          Generated by <span className="text-gradient font-semibold">EightyNine</span> — Portfolio Diversification Engine
        </p>
      </main>
    </div>
  );
}
