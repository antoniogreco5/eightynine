"use client";

import { useState, useEffect, useCallback } from "react";
import { PortfolioSummary } from "@/lib/types";

interface SnapshotData {
  id: string;
  totalValue: number;
  holdingCount: number;
  violationCount: number;
  concentrationScore: number;
  topHolding: string;
  topHoldingWeight: number;
  createdAt: string;
}

interface Props {
  summary: PortfolioSummary;
  holdingsData: unknown[];
}

export default function SnapshotChart({ summary, holdingsData }: Props) {
  const [snapshots, setSnapshots] = useState<SnapshotData[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/snapshots").then((r) => r.json()).then((d) => setSnapshots(d.snapshots ?? []));
  }, []);

  const saveSnapshot = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalValue: summary.totalValue,
          holdingCount: summary.holdingCount,
          violationCount: summary.violationCount,
          concentrationScore: summary.concentrationScore,
          topHolding: summary.largestHolding.ticker,
          topHoldingWeight: summary.largestHolding.weight,
          topSector: summary.largestSector.name,
          topSectorWeight: summary.largestSector.weight,
          holdingsData,
        }),
      });
      const data = await res.json();
      if (data.snapshot) {
        setSnapshots((p) => [...p, {
          ...data.snapshot,
          createdAt: data.snapshot.createdAt,
        }]);
      }
    } catch {} finally {
      setSaving(false);
    }
  }, [summary, holdingsData]);

  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  // SVG chart
  const chartW = 600;
  const chartH = 140;
  const padding = { top: 10, right: 10, bottom: 24, left: 10 };
  const innerW = chartW - padding.left - padding.right;
  const innerH = chartH - padding.top - padding.bottom;

  const allPoints = snapshots.length > 1 ? snapshots : [];
  const scores = allPoints.map((s) => s.concentrationScore);
  const minScore = Math.min(...scores, 0);
  const maxScore = Math.max(...scores, 100);
  const range = maxScore - minScore || 1;

  const points = allPoints.map((s, i) => ({
    x: padding.left + (i / (allPoints.length - 1)) * innerW,
    y: padding.top + innerH - ((s.concentrationScore - minScore) / range) * innerH,
    data: s,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = linePath + ` L ${points[points.length - 1]?.x ?? 0} ${padding.top + innerH} L ${padding.left} ${padding.top + innerH} Z`;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-brand-400 text-base">◉</span>
          <h2 className="text-sm font-semibold">Portfolio History</h2>
          <span className="text-xs text-surface-600">{snapshots.length} snapshots</span>
        </div>
        <button onClick={saveSnapshot} disabled={saving || summary.holdingCount === 0} className="btn-ghost text-xs !py-1.5">
          {saving ? "Saving..." : "Save Snapshot"}
        </button>
      </div>

      {snapshots.length < 2 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-surface-600 mb-1">
            {snapshots.length === 0
              ? "Save your first snapshot to start tracking your diversification over time."
              : "Save one more snapshot to see the chart."}
          </p>
          <p className="text-xs text-surface-600">We recommend saving a snapshot weekly or after major trades.</p>
        </div>
      ) : (
        <>
          {/* SVG Chart */}
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-36 mb-3">
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f8fff" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#4f8fff" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((v) => {
              const y = padding.top + innerH - ((v - minScore) / range) * innerH;
              if (y < padding.top || y > padding.top + innerH) return null;
              return <line key={v} x1={padding.left} y1={y} x2={chartW - padding.right} y2={y} stroke="#1e2a3e" strokeWidth="0.5" />;
            })}
            {/* Area */}
            <path d={areaPath} fill="url(#scoreGrad)" />
            {/* Line */}
            <path d={linePath} fill="none" stroke="#4f8fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Dots */}
            {points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="3" fill="#4f8fff" stroke="#0a0e17" strokeWidth="1.5" />
            ))}
            {/* X-axis labels */}
            {points.filter((_, i) => i === 0 || i === points.length - 1 || i === Math.floor(points.length / 2)).map((p, i) => (
              <text key={i} x={p.x} y={chartH - 4} textAnchor="middle" fill="#4e5d73" fontSize="9" fontFamily="Outfit">
                {new Date(p.data.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </text>
            ))}
          </svg>

          {/* Recent snapshots table */}
          <div className="space-y-1.5">
            {snapshots.slice(-5).reverse().map((s) => (
              <div key={s.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-surface-100/50 transition-colors">
                <span className="text-xs text-surface-600">{new Date(s.createdAt).toLocaleDateString()}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs tabular-nums">{fmt(s.totalValue)}</span>
                  <span className={`text-xs tabular-nums font-semibold ${s.concentrationScore >= 70 ? "text-up" : s.concentrationScore >= 40 ? "text-warn" : "text-down"}`}>
                    {s.concentrationScore}/100
                  </span>
                  <span className={`text-xs tabular-nums ${s.violationCount > 0 ? "text-down" : "text-up"}`}>
                    {s.violationCount}v
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
