"use client";

import { useState } from "react";
import { ComputedHolding, Holding } from "@/lib/types";

interface Props {
  holdings: ComputedHolding[];
  onUpdate: (id: string, updates: Partial<Holding>) => void;
  onRemove: (id: string) => void;
}

export default function HoldingsTable({ holdings, onUpdate, onRemove }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
  const fmtS = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  if (holdings.length === 0) {
    return (
      <div className="card p-16 text-center">
        <p className="text-surface-600 text-sm">No holdings. Add a position or load sample data.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-300">
              {["Ticker", "Shares", "Avg Cost", "Price", "Mkt Value", "Weight", "P/L", "Sector", "Status", ""].map((col) => (
                <th key={col} className="px-4 py-3.5 text-left label !mb-0">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) => {
              const isEd = editingId === h.id;
              const badgeCls = h.status === "violation" ? "badge-violation" : h.status === "warning" ? "badge-warning" : "badge-healthy";
              const badgeLabel = h.status === "violation" ? "Over 5%" : h.status === "warning" ? "Watchlist" : "Healthy";
              const plColor = h.gainLoss >= 0 ? "text-up" : "text-down";
              const weightColor = h.status === "violation" ? "text-down" : h.status === "warning" ? "text-warn" : "text-surface-900";

              return (
                <tr key={h.id} className="border-b border-surface-300/50 hover:bg-surface-200/40 transition-colors group">
                  <td className="px-4 py-3">
                    <span className="font-semibold font-mono text-surface-900 tracking-wide">{h.ticker}</span>
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {isEd ? (
                      <input type="number" defaultValue={h.shares} onBlur={(e) => onUpdate(h.id, { shares: Number(e.target.value) || h.shares })}
                        className="input input-mono w-20 !py-1 !px-2 text-sm" />
                    ) : h.shares}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-surface-700">
                    {isEd ? (
                      <input type="number" step="0.01" defaultValue={h.avgCost} onBlur={(e) => onUpdate(h.id, { avgCost: Number(e.target.value) || h.avgCost })}
                        className="input w-24 !py-1 !px-2 text-sm" />
                    ) : fmt(h.avgCost)}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-surface-700">
                    {isEd ? (
                      <input type="number" step="0.01" defaultValue={h.currentPrice} onBlur={(e) => onUpdate(h.id, { currentPrice: Number(e.target.value) || h.currentPrice })}
                        className="input w-24 !py-1 !px-2 text-sm" />
                    ) : fmt(h.currentPrice)}
                  </td>
                  <td className="px-4 py-3 font-medium tabular-nums">{fmtS(h.marketValue)}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold tabular-nums ${weightColor}`}>{h.weight.toFixed(1)}%</span>
                  </td>
                  <td className={`px-4 py-3 tabular-nums ${plColor}`}>
                    {h.gainLoss >= 0 ? "+" : ""}{fmtS(h.gainLoss)}
                    <span className="text-xs ml-1 opacity-60">
                      {h.gainLoss >= 0 ? "+" : ""}{h.gainLossPercent.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-surface-600 text-xs">{h.sector}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${badgeCls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full bg-current ${h.status === "violation" ? "animate-pulse-soft" : ""}`} />
                      {badgeLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingId(isEd ? null : h.id)}
                        className="p-1.5 rounded-md text-surface-600 hover:text-surface-900 hover:bg-surface-300 transition-colors text-xs">
                        {isEd ? "✓" : "✎"}
                      </button>
                      <button onClick={() => onRemove(h.id)}
                        className="p-1.5 rounded-md text-surface-600 hover:text-down hover:bg-down-dim transition-colors text-xs">
                        ×
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
