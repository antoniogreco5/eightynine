"use client";

import { useState, useEffect, useCallback } from "react";
import { lookupSector } from "@/lib/tickerMap";
import { SECTORS, SectorSummary, ComputedHolding } from "@/lib/types";
import { PortfolioRules } from "@/lib/config";

interface WatchlistItem {
  id: string;
  ticker: string;
  sector: string;
  targetAmount: number;
  currentPrice: number;
  notes: string;
}

interface Props {
  totalValue: number;
  computedHoldings: ComputedHolding[];
  sectors: SectorSummary[];
  rules: PortfolioRules;
}

export default function WatchlistPanel({ totalValue, computedHoldings, sectors, rules }: Props) {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticker, setTicker] = useState("");
  const [amount, setAmount] = useState("");
  const [sector, setSector] = useState("");
  const [autoSec, setAutoSec] = useState(false);

  useEffect(() => {
    fetch("/api/watchlist").then((r) => r.json()).then((d) => setItems(d.items ?? [])).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (ticker.length >= 1) {
      const s = lookupSector(ticker);
      if (s) { setSector(s); setAutoSec(true); }
      else if (autoSec) { setSector(""); setAutoSec(false); }
    }
  }, [ticker]);

  const addItem = async () => {
    if (!ticker || !amount || !sector) return;
    const res = await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker: ticker.toUpperCase(), sector, targetAmount: Number(amount), currentPrice: 0, notes: "" }),
    });
    const data = await res.json();
    if (data.item) setItems((p) => [data.item, ...p]);
    setTicker(""); setAmount(""); setSector(""); setAutoSec(false);
  };

  const removeItem = async (id: string) => {
    setItems((p) => p.filter((x) => x.id !== id));
    fetch("/api/watchlist", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
  };

  const getImpact = useCallback((item: WatchlistItem) => {
    const newTv = totalValue + item.targetAmount;
    const existing = computedHoldings.find((h) => h.ticker === item.ticker);
    const posW = ((( existing?.marketValue ?? 0) + item.targetAmount) / newTv) * 100;
    const existSec = sectors.find((s) => s.name === item.sector);
    const secW = (((existSec?.totalValue ?? 0) + item.targetAmount) / newTv) * 100;
    return { posW, secW, posOk: posW <= rules.maxPositionWeight, secOk: secW <= rules.maxSectorWeight };
  }, [totalValue, computedHoldings, sectors, rules]);

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-warn text-base">☆</span>
        <h2 className="text-sm font-semibold">Watchlist</h2>
        <span className="text-xs text-surface-600">({items.length})</span>
      </div>

      {/* Add form */}
      <div className="flex gap-2 mb-4">
        <input value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} placeholder="Ticker" className="input input-mono !w-24 text-xs" />
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="$ Amount" className="input !w-28 text-xs" />
        <select value={sector} onChange={(e) => { setSector(e.target.value); setAutoSec(false); }} className="input !w-36 text-xs">
          <option value="">{autoSec ? sector : "Sector"}</option>
          {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={addItem} disabled={!ticker || !amount || !sector} className="btn-primary text-xs !py-2 !px-4">+</button>
      </div>

      {loading ? (
        <p className="text-xs text-surface-600 py-4">Loading watchlist...</p>
      ) : items.length === 0 ? (
        <p className="text-xs text-surface-600 py-4">Add tickers you&apos;re considering to see how they&apos;d affect your diversification.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const impact = getImpact(item);
            const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
            return (
              <div key={item.id} className="card-flat p-3 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-semibold text-sm">{item.ticker}</span>
                  <span className="text-xs text-surface-600">{fmt(item.targetAmount)}</span>
                  <span className="text-xs text-surface-600">{item.sector}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs tabular-nums font-medium ${impact.posOk ? "text-up" : "text-down"}`}>
                    Pos: {impact.posW.toFixed(1)}%
                  </span>
                  <span className={`text-xs tabular-nums font-medium ${impact.secOk ? "text-up" : "text-down"}`}>
                    Sec: {impact.secW.toFixed(1)}%
                  </span>
                  <button onClick={() => removeItem(item.id)} className="text-surface-600 hover:text-down text-xs opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
