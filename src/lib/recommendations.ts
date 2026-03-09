import {
  ComputedHolding,
  SectorSummary,
  Violation,
  Recommendation,
  SimulatedTrade,
  SimulationResult,
} from "./types";
import { PortfolioRules } from "./config";

// ─── Recommendation Generator ─────────────────────────────────────────────────

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** Generate recommendations from violations */
export function generateRecommendations(
  violations: Violation[],
  holdings: ComputedHolding[],
  sectors: SectorSummary[],
  totalValue: number,
  rules: PortfolioRules
): Recommendation[] {
  const recs: Recommendation[] = [];

  // Position-level trims
  for (const v of violations.filter((v) => v.type === "position")) {
    const holding = holdings.find((h) => h.ticker === v.label);
    if (!holding) continue;

    const targetValue = (rules.maxPositionWeight / 100) * totalValue;
    const trimAmount = holding.marketValue - targetValue;

    recs.push({
      type: "trim",
      message: `Trim ${v.label} by approximately ${fmt(trimAmount)} to bring it back to ${rules.maxPositionWeight}% (currently ${v.currentWeight.toFixed(1)}%, over by ${v.overage.toFixed(1)}%)`,
      ticker: v.label,
      amountToTrim: trimAmount,
    });
  }

  // Sector-level reductions
  for (const v of violations.filter((v) => v.type === "sector")) {
    const targetValue = (rules.maxSectorWeight / 100) * totalValue;
    const sector = sectors.find((s) => s.name === v.label);
    if (!sector) continue;

    const reduceAmount = sector.totalValue - targetValue;

    recs.push({
      type: "reduce-sector",
      message: `Reduce ${v.label} exposure by approximately ${fmt(reduceAmount)} to meet the ${rules.maxSectorWeight}% sector cap (currently ${v.currentWeight.toFixed(1)}%)`,
      sector: v.label,
      amountToTrim: reduceAmount,
    });
  }

  // General rebalance suggestions
  if (violations.length > 0) {
    // Find underweight sectors
    const avgWeight = 100 / Math.max(sectors.length, 1);
    const underweight = sectors
      .filter((s) => s.weight < avgWeight * 0.6 && s.name !== "Cash / Other")
      .map((s) => s.name);

    if (underweight.length > 0) {
      recs.push({
        type: "rebalance",
        message: `Consider reallocating excess capital into underweight sectors: ${underweight.join(", ")}`,
      });
    }

    recs.push({
      type: "general",
      message: `You have ${violations.length} active violation${violations.length === 1 ? "" : "s"}. Addressing the largest overages first will have the most impact on your portfolio balance.`,
    });
  }

  return recs;
}

// ─── Trade Simulator ──────────────────────────────────────────────────────────

/** Simulate a hypothetical trade against the current portfolio */
export function simulateTrade(
  trade: SimulatedTrade,
  holdings: ComputedHolding[],
  sectors: SectorSummary[],
  totalValue: number,
  rules: PortfolioRules
): SimulationResult {
  const newTotalValue = totalValue + trade.dollarAmount;
  const messages: string[] = [];

  // Find existing position value for this ticker
  const existingHolding = holdings.find(
    (h) => h.ticker.toUpperCase() === trade.ticker.toUpperCase()
  );
  const existingPositionValue = existingHolding?.marketValue ?? 0;
  const newPositionValue = existingPositionValue + trade.dollarAmount;
  const newPositionWeight = (newPositionValue / newTotalValue) * 100;

  // Find existing sector value
  const existingSector = sectors.find((s) => s.name === trade.sector);
  const existingSectorValue = existingSector?.totalValue ?? 0;
  const newSectorValue = existingSectorValue + trade.dollarAmount;
  const newSectorWeight = (newSectorValue / newTotalValue) * 100;

  // Evaluate position status
  let positionStatus: SimulationResult["positionStatus"] = "allowed";
  if (newPositionWeight > rules.maxPositionWeight) {
    positionStatus = "not-recommended";
    messages.push(
      `This purchase would bring ${trade.ticker.toUpperCase()} to ${newPositionWeight.toFixed(1)}%, above your ${rules.maxPositionWeight}% position cap`
    );
  } else if (
    newPositionWeight >
    rules.maxPositionWeight - rules.borderlineThreshold
  ) {
    positionStatus = "borderline";
    messages.push(
      `This purchase would bring ${trade.ticker.toUpperCase()} to ${newPositionWeight.toFixed(1)}%, close to your ${rules.maxPositionWeight}% position cap`
    );
  }

  // Evaluate sector status
  let sectorStatus: SimulationResult["sectorStatus"] = "allowed";
  if (newSectorWeight > rules.maxSectorWeight) {
    sectorStatus = "not-recommended";
    messages.push(
      `This trade would push ${trade.sector} to ${newSectorWeight.toFixed(1)}%, above your ${rules.maxSectorWeight}% sector limit`
    );
  } else if (
    newSectorWeight >
    rules.maxSectorWeight - rules.borderlineThreshold
  ) {
    sectorStatus = "borderline";
    messages.push(
      `This trade would bring ${trade.sector} to ${newSectorWeight.toFixed(1)}%, close to your ${rules.maxSectorWeight}% sector limit`
    );
  }

  if (positionStatus === "allowed" && sectorStatus === "allowed") {
    messages.push(
      `This trade fits within your current rules. ${trade.ticker.toUpperCase()} would be ${newPositionWeight.toFixed(1)}% and ${trade.sector} would be ${newSectorWeight.toFixed(1)}%.`
    );
  }

  return {
    newPositionWeight,
    newSectorWeight,
    positionViolation: positionStatus === "not-recommended",
    sectorViolation: sectorStatus === "not-recommended",
    positionStatus,
    sectorStatus,
    messages,
  };
}
