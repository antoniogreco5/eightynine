import { Holding, ComputedHolding, HoldingStatus, SectorSummary, PortfolioSummary } from "./types";
import { PortfolioRules } from "./config";

export function computeHolding(holding: Holding, totalValue: number, rules: PortfolioRules): ComputedHolding {
  const marketValue = holding.shares * holding.currentPrice;
  const costBasis = holding.shares * holding.avgCost;
  const gainLoss = marketValue - costBasis;
  const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;
  const weight = totalValue > 0 ? (marketValue / totalValue) * 100 : 0;

  let status: HoldingStatus = "healthy";
  if (weight > rules.maxPositionWeight) status = "violation";
  else if (weight > rules.maxPositionWeight - rules.warningBuffer) status = "warning";

  return { ...holding, marketValue, costBasis, gainLoss, gainLossPercent, weight, status };
}

export function calcTotalValue(holdings: Holding[]): number {
  return holdings.reduce((sum, h) => sum + h.shares * h.currentPrice, 0);
}

export function computeAllHoldings(holdings: Holding[], rules: PortfolioRules): ComputedHolding[] {
  const totalValue = calcTotalValue(holdings);
  return holdings.map((h) => computeHolding(h, totalValue, rules));
}

export function computeSectors(computed: ComputedHolding[], totalValue: number, rules: PortfolioRules): SectorSummary[] {
  const sectorMap = new Map<string, { totalValue: number; holdingCount: number }>();
  for (const h of computed) {
    const existing = sectorMap.get(h.sector) ?? { totalValue: 0, holdingCount: 0 };
    existing.totalValue += h.marketValue;
    existing.holdingCount += 1;
    sectorMap.set(h.sector, existing);
  }
  const sectors: SectorSummary[] = [];
  for (const [name, data] of sectorMap) {
    const weight = totalValue > 0 ? (data.totalValue / totalValue) * 100 : 0;
    const overage = Math.max(0, weight - rules.maxSectorWeight);
    sectors.push({ name, totalValue: data.totalValue, weight, holdingCount: data.holdingCount, status: weight > rules.maxSectorWeight ? "above-limit" : "within-limit", overage });
  }
  return sectors.sort((a, b) => b.weight - a.weight);
}

export function computeSummary(computed: ComputedHolding[], sectors: SectorSummary[], totalValue: number): PortfolioSummary {
  const largestHolding = computed.reduce((max, h) => (h.weight > max.weight ? h : max), { ticker: "—", weight: 0 } as { ticker: string; weight: number });
  const largestSector = sectors.reduce((max, s) => (s.weight > max.weight ? s : max), { name: "—", weight: 0 } as { name: string; weight: number });
  const positionViolations = computed.filter((h) => h.status === "violation").length;
  const sectorViolations = sectors.filter((s) => s.status === "above-limit").length;

  const totalCostBasis = computed.reduce((s, h) => s + h.costBasis, 0);
  const totalGainLoss = totalValue - totalCostBasis;
  const totalGainLossPercent = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;

  const hhi = computed.reduce((sum, h) => sum + (h.weight / 100) ** 2, 0);
  const maxHhi = 1;
  const minHhi = computed.length > 0 ? 1 / computed.length : 1;
  const normalizedScore = computed.length > 1 ? Math.round(((maxHhi - hhi) / (maxHhi - minHhi)) * 100) : 0;

  return {
    totalValue,
    holdingCount: computed.length,
    largestHolding: { ticker: largestHolding.ticker, weight: largestHolding.weight },
    largestSector: { name: largestSector.name, weight: largestSector.weight },
    violationCount: positionViolations + sectorViolations,
    concentrationScore: Math.max(0, Math.min(100, normalizedScore)),
    totalGainLoss,
    totalGainLossPercent,
  };
}
