"use client";

import { useState, useEffect, useMemo } from "react";
import { ComputedHolding, SectorSummary, SECTORS } from "@/lib/types";
import { PortfolioRules } from "@/lib/config";
import { lookupSector } from "@/lib/tickerMap";

interface PlannedTrade {
  id: string;
  ticker: string;
  action: "buy" | "sell";
  dollarAmount: number;
  sector: string;
}

interface Props {
  computedHoldings: ComputedHolding[];
  sectors: SectorSummary[];
  totalValue: number;
  rules: PortfolioRules;
}

export default function MultiTradeSimulator({ computedHoldings, sectors, totalValue, rules }: Props) {
  const [trades, setTrades] = useState<PlannedTrade[]>([]);
  const [ticker, setTicker] = useState("");
  const [action, setAction] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [sector, setSector] = useState("");
  const [autoSec, setAutoSec] = useState(false);

  useEffect(() => {
    if (ticker.length >= 1) {
      const s = lookupSector(ticker);
      if (s) { setSector(s); setAutoSec(true); }
      else if (autoSec) { setSector(""); setAutoSec(false); }
    }
  }, [ticker]);

  const addTrade = () => {
    if (!ticker || !amount || !sector) return;
    setTrades((p) => [
      ...p,
      { id: String(Date.now()), ticker: ticker.toUpperCase(), action, dollarAmount: Number(amount), sector },
    ]);
    setTicker(""); setAmount(""); setSector(""); setAutoSec(false);
  };

  const removeTrade = (id: string) => setTrades((p) => p.filter((t) => t.id !== id));
  const clearAll = () => setTrades([]);

  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  // ─── Simulate all trades combined ──────────────────────────────────────────
  const simulation = useMemo(() => {
    if (trades.length === 0) return null;

    // Net change per ticker and sector
    const tickerDelta = new Map<string, number>();
    const sectorDelta = new Map<string, number>();
    let netCashChange = 0;

    for (const t of trades) {
      const sign = t.action === "buy" ? 1 : -1;
      const delta = t.dollarAmount * sign;
      tickerDelta.set(t.ticker, (tickerDelta.get(t.ticker) ?? 0) + delta);
      sectorDelta.set(t.sector, (sectorDelta.get(t.sector) ?? 0) + delta);
      netCashChange += delta;
    }

    const newTotalValue = totalValue + netCashChange;
    if (newTotalValue <= 0) return null;

    // New position weights
    const positionResults: { ticker: string; currentWeight: number; newWeight: number; newValue: number; violation: boolean }[] = [];
    const allTickers = new Set([...computedHoldings.map((h) => h.ticker), ...tickerDelta.keys()]);

    for (const t of allTickers) {
      const existing = computedHoldings.find((h) => h.ticker === t);
      const currentValue = existing?.marketValue ?? 0;
      const currentWeight = existing?.weight ?? 0;
      const delta = tickerDelta.get(t) ?? 0;
      const newValue = Math.max(0, currentValue + delta);
      const newWeight = (newValue / newTotalValue) * 100;
      if (newWeight > 0.01 || delta !== 0) {
        positionResults.push({ ticker: t, currentWeight, newWeight, newValue, violation: newWeight > rules.maxPositionWeight });
      }
    }

    // New sector weights
    const sectorResults: { sector: string; currentWeight: number; newWeight: number; newValue: number; violation: boolean }[] = [];
    const allSectors = new Set([...sectors.map((s) => s.name), ...sectorDelta.keys()]);

    for (const s of allSectors) {
      const existing = sectors.find((x) => x.name === s);
      const currentValue = existing?.totalValue ?? 0;
      const currentWeight = existing?.weight ?? 0;
      const delta = sectorDelta.get(s) ?? 0;
      const newValue = Math.max(0, currentValue + delta);
      const newWeight = (newValue / newTotalValue) * 100;
      if (newWeight > 0.01 || delta !== 0) {
        sectorResults.push({ sector: s, currentWeight, newWeight, newValue, violation: newWeight > rules.maxSectorWeight });
      }
    }

    const posViolations = positionResults.filter((p) => p.violation);
    const secViolations = sectorResults.filter((s) => s.violation);
    const totalViolations = posViolations.length + secViolations.length;

    // Messages
    const messages: { type: "good" | "warn" | "bad"; text: string }[] = [];

    for (const pv of posViolations) {
      messages.push({ type: "bad", text: `${pv.ticker} would be ${pv.newWeight.toFixed(1)}%, above the ${rules.maxPositionWeight}% cap` });
    }
    for (const sv of secViolations) {
      messages.push({ type: "bad", text: `${sv.sector} would be ${sv.newWeight.toFixed(1)}%, above the ${rules.maxSectorWeight}% limit` });
    }
    if (totalViolations === 0) {
      messages.push({ type: "good", text: `All ${trades.length} trade${trades.length !== 1 ? "s" : ""} fit within your diversification rules` });
    }

    // Check if any existing violations would be fixed
    const currentPosViolations = computedHoldings.filter((h) => h.status === "violation");
    for (const cv of currentPosViolations) {
      const result = positionResults.find((p) => p.ticker === cv.ticker);
      if (result && !result.violation) {
        messages.push({ type: "good", text: `${cv.ticker} would drop from ${cv.weight.toFixed(1)}% to ${result.newWeight.toFixed(1)}% — violation resolved` });
      }
    }

    return {
      newTotalValue,
      netCashChange,
      positionResults: positionResults.sort((a, b) => b.newWeight - a.newWeight),
      sectorResults: sectorResults.sort((a, b) => b.newWeight - a.newWeight),
      posViolations: posViolations.length,
      secViolations: secViolations.length,
      totalViolations,
      messages,
    };
  }, [trades, computedHoldings, sectors, totalValue, rules]);

  const msgIcon = (type: string) => type === "good" ? "✓" : type === "warn" ? "⚠" : "✕";
  const msgColor = (type: string) => type === "good" ? "text-up" : type === "warn" ? "text-warn" : "text-down";

  return (
    <div className="space-y-6">
      {/* Input area */}
      <div className="card p-6">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="text-cyan text-lg">⧫</span>
          <h2 className="text-sm font-semibold">Multi-Trade Simulator</h2>
        </div>
        <p className="text-xs text-surface-600 mb-5">
          Queue up multiple buys and sells to see the combined impact on your portfolio.
        </p>

        <div className="flex flex-wrap gap-2 items-end">
          {/* Action toggle */}
          <div>
            <label className="label">Action</label>
            <div className="flex rounded-lg overflow-hidden border border-surface-400">
              <button onClick={() => setAction("buy")}
                className={`px-4 py-2 text-xs font-medium transition-colors ${action === "buy" ? "bg-up/20 text-up" : "text-surface-600 hover:text-surface-800"}`}>
                Buy
              </button>
              <button onClick={() => setAction("sell")}
                className={`px-4 py-2 text-xs font-medium transition-colors ${action === "sell" ? "bg-down/20 text-down" : "text-surface-600 hover:text-surface-800"}`}>
                Sell
              </button>
            </div>
          </div>

          <div>
            <label className="label">Ticker</label>
            <input value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} placeholder="NVDA" className="input input-mono !w-28" />
          </div>

          <div>
            <label className="label">Amount ($)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="5,000" className="input !w-32" />
          </div>

          <div>
            <label className="label">
              Sector{autoSec && <span className="ml-1 text-up text-[10px] normal-case tracking-normal">✓</span>}
            </label>
            <select value={sector} onChange={(e) => { setSector(e.target.value); setAutoSec(false); }}
              className={`input !w-44 ${autoSec ? "!border-up/30" : ""}`}>
              <option value="">Select</option>
              {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <button onClick={addTrade} disabled={!ticker || !amount || !sector} className="btn-primary !py-2.5 text-sm">
            Add Trade
          </button>
        </div>
      </div>

      {/* Queued trades */}
      {trades.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Planned Trades ({trades.length})</h3>
            <button onClick={clearAll} className="btn-ghost text-xs !py-1">Clear All</button>
          </div>

          <div className="space-y-2 mb-6">
            {trades.map((t) => (
              <div key={t.id} className="card-flat p-3 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${t.action === "buy" ? "bg-up-dim text-up" : "bg-down-dim text-down"}`}>
                    {t.action.toUpperCase()}
                  </span>
                  <span className="font-mono font-semibold text-sm">{t.ticker}</span>
                  <span className="text-xs text-surface-600">{fmt(t.dollarAmount)}</span>
                  <span className="text-xs text-surface-600">{t.sector}</span>
                </div>
                <button onClick={() => removeTrade(t.id)} className="text-surface-600 hover:text-down text-sm opacity-0 group-hover:opacity-100 transition-opacity">×</button>
              </div>
            ))}
          </div>

          {/* Simulation Results */}
          {simulation && (
            <div className="border-t border-surface-300 pt-5 space-y-5">
              {/* Summary row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="card-flat p-3">
                  <p className="label !mb-1">New Portfolio Value</p>
                  <p className="text-lg font-bold tabular-nums">{fmt(simulation.newTotalValue)}</p>
                  <p className={`text-xs tabular-nums ${simulation.netCashChange >= 0 ? "text-up" : "text-down"}`}>
                    {simulation.netCashChange >= 0 ? "+" : ""}{fmt(simulation.netCashChange)} net
                  </p>
                </div>
                <div className={`card-flat p-3 ${simulation.totalViolations === 0 ? "border-up/20" : "border-down/20"} border`}>
                  <p className="label !mb-1">New Violations</p>
                  <p className={`text-lg font-bold ${simulation.totalViolations === 0 ? "text-up" : "text-down"}`}>
                    {simulation.totalViolations}
                  </p>
                  <p className="text-xs text-surface-600">{simulation.posViolations} position · {simulation.secViolations} sector</p>
                </div>
                <div className="card-flat p-3">
                  <p className="label !mb-1">Verdict</p>
                  <p className={`text-sm font-semibold ${simulation.totalViolations === 0 ? "text-up" : "text-down"}`}>
                    {simulation.totalViolations === 0 ? "✓ All Clear" : "✕ Rules Broken"}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-2">
                {simulation.messages.map((m, i) => (
                  <div key={i} className="flex items-start gap-2.5 py-2 px-3 rounded-xl card-flat">
                    <span className={`text-sm mt-0.5 ${msgColor(m.type)}`}>{msgIcon(m.type)}</span>
                    <p className="text-[13px] text-surface-700 leading-relaxed">{m.text}</p>
                  </div>
                ))}
              </div>

              {/* Position impact table */}
              <div>
                <h4 className="label mb-3">Position Impact (Top 10)</h4>
                <div className="space-y-1.5">
                  {simulation.positionResults.slice(0, 10).map((p) => {
                    const delta = p.newWeight - p.currentWeight;
                    return (
                      <div key={p.ticker} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-surface-100/50">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-semibold w-14">{p.ticker}</span>
                          <div className="flex-1 w-32">
                            <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{
                                width: `${Math.min((p.newWeight / rules.maxPositionWeight) * 100, 100)}%`,
                                background: p.violation ? "linear-gradient(90deg,#f87171,#ef4444)" : "linear-gradient(90deg,#4f8fff,#0dd4ce)",
                              }} />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-xs tabular-nums ${delta > 0 ? "text-up" : delta < 0 ? "text-down" : "text-surface-600"}`}>
                            {delta > 0 ? "+" : ""}{delta.toFixed(1)}%
                          </span>
                          <span className={`text-xs tabular-nums font-semibold w-12 text-right ${p.violation ? "text-down" : ""}`}>
                            {p.newWeight.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sector impact */}
              <div>
                <h4 className="label mb-3">Sector Impact</h4>
                <div className="space-y-1.5">
                  {simulation.sectorResults.map((s) => {
                    const delta = s.newWeight - s.currentWeight;
                    return (
                      <div key={s.sector} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-surface-100/50">
                        <span className="text-sm w-44 truncate">{s.sector}</span>
                        <div className="flex items-center gap-4">
                          <span className={`text-xs tabular-nums ${delta > 0 ? "text-up" : delta < 0 ? "text-down" : "text-surface-600"}`}>
                            {delta > 0 ? "+" : ""}{delta.toFixed(1)}%
                          </span>
                          <span className={`text-xs tabular-nums font-semibold w-12 text-right ${s.violation ? "text-down" : ""}`}>
                            {s.newWeight.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {trades.length === 0 && (
        <div className="card p-12 text-center">
          <p className="text-surface-600 text-sm mb-1">No trades queued yet.</p>
          <p className="text-surface-600 text-xs">Add buys and sells above to see how they&apos;d impact your portfolio together.</p>
        </div>
      )}
    </div>
  );
}
