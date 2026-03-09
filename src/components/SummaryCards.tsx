"use client";

import { PortfolioSummary } from "@/lib/types";
import { PortfolioRules } from "@/lib/config";

interface Props {
  summary: PortfolioSummary;
  rules: PortfolioRules;
}

export default function SummaryCards({ summary, rules }: Props) {
  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const glColor = summary.totalGainLoss >= 0 ? "text-up" : "text-down";
  const glPrefix = summary.totalGainLoss >= 0 ? "+" : "";

  const cards = [
    {
      label: "Portfolio Value",
      value: fmt(summary.totalValue),
      sub: `${glPrefix}${fmt(summary.totalGainLoss)} (${glPrefix}${summary.totalGainLossPercent.toFixed(1)}%)`,
      subColor: glColor,
      accent: "from-brand-400/10 to-transparent",
    },
    {
      label: "Holdings",
      value: String(summary.holdingCount),
      sub: `Largest: ${summary.largestHolding.ticker} at ${summary.largestHolding.weight.toFixed(1)}%`,
      subColor: summary.largestHolding.weight > rules.maxPositionWeight ? "text-down" : "text-surface-600",
      accent: "from-cyan/5 to-transparent",
    },
    {
      label: "Top Sector",
      value: summary.largestSector.name,
      sub: `${summary.largestSector.weight.toFixed(1)}% allocation`,
      subColor: summary.largestSector.weight > rules.maxSectorWeight ? "text-down" : "text-surface-600",
      accent: "from-transparent to-transparent",
    },
    {
      label: "Violations",
      value: String(summary.violationCount),
      sub: summary.violationCount === 0 ? "Portfolio compliant" : "Rules breached",
      subColor: summary.violationCount === 0 ? "text-up" : "text-down",
      accent: summary.violationCount === 0 ? "from-up/5 to-transparent" : "from-down/5 to-transparent",
    },
    {
      label: "Diversification",
      value: `${summary.concentrationScore}`,
      sub: summary.concentrationScore >= 70 ? "Well diversified" : summary.concentrationScore >= 40 ? "Moderate" : "Concentrated",
      subColor: summary.concentrationScore >= 70 ? "text-up" : summary.concentrationScore >= 40 ? "text-warn" : "text-down",
      accent: "from-transparent to-transparent",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-8">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className={`card relative overflow-hidden p-5 stagger-${i + 1} animate-slide-up`}
        >
          {/* Subtle gradient accent */}
          <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} pointer-events-none`} />

          <div className="relative">
            <p className="label mb-3">{card.label}</p>
            <p className="text-xl font-bold tabular-nums tracking-tight truncate">
              {card.value}
            </p>
            <p className={`text-xs mt-1.5 tabular-nums ${card.subColor}`}>
              {card.sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
