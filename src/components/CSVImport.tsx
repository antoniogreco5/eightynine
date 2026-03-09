"use client";

import { useState, useRef } from "react";
import { Holding, SECTORS } from "@/lib/types";
import { lookupSector } from "@/lib/tickerMap";

interface Props {
  onImport: (holdings: Omit<Holding, "id">[]) => void;
  onCancel: () => void;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, "").toLowerCase());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = values[i] ?? ""));
    return row;
  });
}

const COLUMN_HINTS: Record<string, string[]> = {
  ticker: ["ticker", "symbol", "stock", "name", "sym"],
  shares: ["shares", "quantity", "qty", "amount", "units"],
  avgCost: ["avg cost", "average cost", "cost basis", "cost", "avg price", "purchase price", "cost/share"],
  currentPrice: ["current price", "price", "last price", "market price", "close", "last"],
  sector: ["sector", "industry", "category"],
};

function guessColumn(headers: string[], field: string): string {
  const hints = COLUMN_HINTS[field] ?? [];
  for (const hint of hints) {
    const match = headers.find((h) => h.toLowerCase().includes(hint));
    if (match) return match;
  }
  return "";
}

export default function CSVImport({ onImport, onCancel }: Props) {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length === 0) return;
      const h = Object.keys(parsed[0]);
      setHeaders(h);
      setRows(parsed);
      setMapping({
        ticker: guessColumn(h, "ticker"),
        shares: guessColumn(h, "shares"),
        avgCost: guessColumn(h, "avgCost"),
        currentPrice: guessColumn(h, "currentPrice"),
        sector: guessColumn(h, "sector"),
      });
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleImport = () => {
    const holdings: Omit<Holding, "id">[] = rows
      .map((row) => {
        const ticker = (row[mapping.ticker] ?? "").toUpperCase().trim();
        if (!ticker) return null;
        const shares = parseFloat(row[mapping.shares] ?? "0");
        const avgCost = parseFloat((row[mapping.avgCost] ?? "0").replace(/[$,]/g, ""));
        const currentPrice = parseFloat((row[mapping.currentPrice] ?? "0").replace(/[$,]/g, ""));
        const csvSector = row[mapping.sector] ?? "";
        const sector = csvSector && SECTORS.includes(csvSector as typeof SECTORS[number])
          ? csvSector
          : lookupSector(ticker) ?? "Technology";

        if (shares <= 0) return null;
        return { ticker, shares, avgCost: avgCost || 0, currentPrice: currentPrice || avgCost, sector, notes: "" };
      })
      .filter(Boolean) as Omit<Holding, "id">[];

    if (holdings.length > 0) onImport(holdings);
  };

  const validCount = rows.filter((r) => (r[mapping.ticker] ?? "").trim()).length;

  return (
    <div className="card border-brand-400/20 p-6">
      <h3 className="text-sm font-semibold mb-4">Import from CSV</h3>

      {rows.length === 0 ? (
        <>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
              dragOver ? "border-brand-400 bg-info-dim" : "border-surface-400 hover:border-surface-600"
            }`}
          >
            <p className="text-surface-700 text-sm mb-1">Drag & drop a CSV file here</p>
            <p className="text-surface-600 text-xs">or click to browse</p>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>
          <p className="text-xs text-surface-600 mt-3">
            Works with exports from Schwab, Fidelity, Robinhood, TD, and most brokers. Needs at minimum a ticker and shares column.
          </p>
          <button onClick={onCancel} className="btn-ghost text-xs mt-3">Cancel</button>
        </>
      ) : (
        <>
          <p className="text-xs text-surface-600 mb-4">
            Found <span className="text-surface-900 font-semibold">{rows.length}</span> rows with{" "}
            <span className="text-surface-900 font-semibold">{headers.length}</span> columns. Map your columns below.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
            {(["ticker", "shares", "avgCost", "currentPrice", "sector"] as const).map((field) => (
              <div key={field}>
                <label className="label">{field === "avgCost" ? "Avg Cost" : field === "currentPrice" ? "Price" : field}</label>
                <select
                  value={mapping[field] ?? ""}
                  onChange={(e) => setMapping((p) => ({ ...p, [field]: e.target.value }))}
                  className={`input text-xs ${mapping[field] ? "!border-up/30" : "!border-down/30"}`}
                >
                  <option value="">— skip —</option>
                  {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            ))}
          </div>

          {/* Preview */}
          <div className="card-flat overflow-hidden mb-4 max-h-48 overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-surface-300">
                  {["Ticker", "Shares", "Avg Cost", "Price", "Sector"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-surface-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 8).map((row, i) => (
                  <tr key={i} className="border-b border-surface-300/30">
                    <td className="px-3 py-1.5 font-mono font-semibold">{(row[mapping.ticker] ?? "—").toUpperCase()}</td>
                    <td className="px-3 py-1.5 tabular-nums">{row[mapping.shares] ?? "—"}</td>
                    <td className="px-3 py-1.5 tabular-nums">{row[mapping.avgCost] ?? "—"}</td>
                    <td className="px-3 py-1.5 tabular-nums">{row[mapping.currentPrice] ?? "—"}</td>
                    <td className="px-3 py-1.5">{row[mapping.sector] || lookupSector((row[mapping.ticker] ?? "").toUpperCase()) || "auto"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 8 && <p className="text-xs text-surface-600 px-3 py-2">+{rows.length - 8} more rows</p>}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleImport} disabled={!mapping.ticker || !mapping.shares} className="btn-primary">
              Import {validCount} Holdings
            </button>
            <button onClick={() => { setRows([]); setHeaders([]); }} className="btn-ghost text-xs">
              Choose Different File
            </button>
            <button onClick={onCancel} className="btn-ghost text-xs">Cancel</button>
          </div>
        </>
      )}
    </div>
  );
}
