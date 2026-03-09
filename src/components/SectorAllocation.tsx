"use client";

import { SectorSummary } from "@/lib/types";
import { PortfolioRules } from "@/lib/config";

interface Props {
  sectors: SectorSummary[];
  rules: PortfolioRules;
}

export default function SectorAllocation({ sectors, rules }: Props) {
  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const maxWeight = Math.max(...sectors.map((s) => s.weight), rules.maxSectorWeight);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold">Sector Allocation</h2>
        <div className="flex items-center gap-2">
          <div className="w-3 h-[2px] bg-surface-600 rounded opacity-50" />
          <span className="text-[11px] text-surface-600 font-medium">{rules.maxSectorWeight}% limit</span>
        </div>
      </div>

      <div className="space-y-4">
        {sectors.map((sector) => {
          const isOver = sector.status === "above-limit";
          const barWidth = Math.min((sector.weight / maxWeight) * 100, 100);
          const limitPos = (rules.maxSectorWeight / maxWeight) * 100;

          return (
            <div key={sector.name}>
              {/* Label row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-[13px] font-medium">{sector.name}</span>
                  <span className="text-[11px] text-surface-600 tabular-nums">
                    {sector.holdingCount}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-surface-600 tabular-nums">{fmt(sector.totalValue)}</span>
                  <span className={`text-[13px] font-semibold tabular-nums ${isOver ? "text-down" : "text-surface-900"}`}>
                    {sector.weight.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Bar */}
              <div className="relative h-2 bg-surface-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${barWidth}%`,
                    background: isOver
                      ? "linear-gradient(90deg, #f87171, #ef4444)"
                      : "linear-gradient(90deg, #4f8fff, #0dd4ce)",
                    opacity: 0.9,
                  }}
                />
                <div
                  className="absolute top-0 bottom-0 w-px bg-surface-600 opacity-40"
                  style={{ left: `${limitPos}%` }}
                />
              </div>

              {isOver && (
                <p className="text-[11px] text-down mt-1.5 font-medium">
                  +{sector.overage.toFixed(1)}% over limit
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
