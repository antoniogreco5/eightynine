"use client";

import { Recommendation, Violation } from "@/lib/types";

interface Props {
  recommendations: Recommendation[];
  violations: Violation[];
}

export default function Recommendations({ recommendations }: Props) {
  if (recommendations.length === 0) {
    return (
      <div className="card p-6">
        <h2 className="text-sm font-semibold mb-4">Recommendations</h2>
        <div className="flex items-center gap-3 py-4">
          <div className="w-8 h-8 rounded-full bg-up-dim flex items-center justify-center">
            <span className="text-up text-sm">✓</span>
          </div>
          <p className="text-sm text-surface-700">Your portfolio is within all diversification limits.</p>
        </div>
      </div>
    );
  }

  const trimRecs = recommendations.filter((r) => r.type === "trim");
  const sectorRecs = recommendations.filter((r) => r.type === "reduce-sector");
  const generalRecs = recommendations.filter((r) => r.type === "rebalance" || r.type === "general");

  const sections = [
    { recs: trimRecs, icon: "↓", color: "text-warn", bg: "bg-warn-dim", label: "Trim Positions" },
    { recs: sectorRecs, icon: "◐", color: "text-down", bg: "bg-down-dim", label: "Reduce Sectors" },
    { recs: generalRecs, icon: "→", color: "text-brand-400", bg: "bg-info-dim", label: "Rebalance" },
  ];

  return (
    <div className="card p-6">
      <h2 className="text-sm font-semibold mb-5">Recommendations</h2>
      <div className="space-y-5">
        {sections.map((section) => {
          if (section.recs.length === 0) return null;
          return (
            <div key={section.label}>
              <p className={`text-[11px] font-semibold uppercase tracking-wider ${section.color} mb-2.5`}>
                {section.label}
              </p>
              <div className="space-y-2">
                {section.recs.map((r, i) => (
                  <div key={i} className="flex items-start gap-3 py-2.5 px-3.5 rounded-xl card-flat">
                    <span className={`text-sm mt-0.5 ${section.color} flex-shrink-0`}>{section.icon}</span>
                    <p className="text-[13px] text-surface-700 leading-relaxed">{r.message}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
