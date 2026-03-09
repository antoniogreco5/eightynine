"use client";

import { useState, useEffect } from "react";
import { Holding, SECTORS } from "@/lib/types";
import { lookupSector } from "@/lib/tickerMap";

interface Props {
  onAdd: (holding: Omit<Holding, "id">) => void;
  onCancel: () => void;
}

export default function AddHoldingForm({ onAdd, onCancel }: Props) {
  const [form, setForm] = useState({ ticker: "", shares: "", avgCost: "", currentPrice: "", sector: "", notes: "" });
  const [autoSector, setAutoSector] = useState(false);
  const [fetchingPrice, setFetchingPrice] = useState(false);

  // Auto-detect sector
  useEffect(() => {
    if (form.ticker.length >= 1) {
      const sector = lookupSector(form.ticker);
      if (sector) { setForm((p) => ({ ...p, sector })); setAutoSector(true); }
      else if (autoSector) { setForm((p) => ({ ...p, sector: "" })); setAutoSector(false); }
    }
  }, [form.ticker]);

  // Auto-fetch price when ticker is entered (debounced)
  useEffect(() => {
    if (form.ticker.length < 1) return;
    const timer = setTimeout(async () => {
      setFetchingPrice(true);
      try {
        const res = await fetch(`/api/prices?symbols=${form.ticker}`);
        const data = await res.json();
        const price = data.prices?.[form.ticker.toUpperCase()]?.price;
        if (price) {
          setForm((p) => ({ ...p, currentPrice: String(price) }));
        }
      } catch {} finally {
        setFetchingPrice(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [form.ticker]);

  const handleSubmit = () => {
    if (!form.ticker || !form.shares || !form.avgCost || !form.currentPrice || !form.sector) return;
    onAdd({
      ticker: form.ticker.toUpperCase(),
      shares: Number(form.shares),
      avgCost: Number(form.avgCost),
      currentPrice: Number(form.currentPrice),
      sector: form.sector,
      notes: form.notes,
    });
  };

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));
  const canSubmit = form.ticker && form.shares && form.avgCost && form.currentPrice && form.sector;

  return (
    <div className="card border-brand-400/20 p-6">
      <h3 className="text-sm font-semibold mb-5">Add Position</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div>
          <label className="label">Ticker</label>
          <input type="text" value={form.ticker} onChange={(e) => update("ticker", e.target.value.toUpperCase())}
            placeholder="AAPL" className="input input-mono" />
        </div>
        <div>
          <label className="label">Shares</label>
          <input type="number" value={form.shares} onChange={(e) => update("shares", e.target.value)}
            placeholder="100" className="input" />
        </div>
        <div>
          <label className="label">Avg Cost</label>
          <input type="number" step="0.01" value={form.avgCost} onChange={(e) => update("avgCost", e.target.value)}
            placeholder="150.00" className="input" />
        </div>
        <div>
          <label className="label">
            Price
            {fetchingPrice && <span className="ml-1.5 text-brand-400 normal-case tracking-normal text-[10px]">loading...</span>}
            {!fetchingPrice && form.currentPrice && form.ticker.length >= 2 && <span className="ml-1.5 text-up normal-case tracking-normal text-[10px]">✓ live</span>}
          </label>
          <input type="number" step="0.01" value={form.currentPrice} onChange={(e) => update("currentPrice", e.target.value)}
            placeholder="175.00" className="input" />
        </div>
        <div>
          <label className="label">
            Sector
            {autoSector && <span className="ml-1.5 text-up normal-case tracking-normal text-[10px]">✓ auto</span>}
          </label>
          <select value={form.sector} onChange={(e) => { update("sector", e.target.value); setAutoSector(false); }}
            className={`input ${autoSector ? "!border-up/30" : ""}`}>
            <option value="">Select</option>
            {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Notes</label>
          <input type="text" value={form.notes} onChange={(e) => update("notes", e.target.value)}
            placeholder="Optional" className="input" />
        </div>
      </div>

      <div className="flex gap-2 mt-5">
        <button onClick={handleSubmit} disabled={!canSubmit}
          className="btn-primary bg-gradient-to-r from-up to-emerald-500 !shadow-glow-up">
          Add Position
        </button>
        <button onClick={onCancel} className="btn-ghost">Cancel</button>
      </div>
    </div>
  );
}
