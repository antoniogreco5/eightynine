import { ComputedHolding, SectorSummary, Violation } from "./types";
import { PortfolioRules } from "./config";

// ─── Rule Engine ──────────────────────────────────────────────────────────────
// Evaluates all portfolio rules and returns a list of violations.
// Designed to be easily extensible with new rule types.

/** Check all position-level rules */
export function checkPositionRules(
  holdings: ComputedHolding[],
  rules: PortfolioRules
): Violation[] {
  const violations: Violation[] = [];

  for (const h of holdings) {
    if (h.weight > rules.maxPositionWeight) {
      violations.push({
        type: "position",
        label: h.ticker,
        currentWeight: h.weight,
        limit: rules.maxPositionWeight,
        overage: h.weight - rules.maxPositionWeight,
        severity: h.weight > rules.maxPositionWeight * 1.5 ? "critical" : "warning",
      });
    }
  }

  return violations.sort((a, b) => b.overage - a.overage);
}

/** Check all sector-level rules */
export function checkSectorRules(
  sectors: SectorSummary[],
  rules: PortfolioRules
): Violation[] {
  const violations: Violation[] = [];

  for (const s of sectors) {
    if (s.weight > rules.maxSectorWeight) {
      violations.push({
        type: "sector",
        label: s.name,
        currentWeight: s.weight,
        limit: rules.maxSectorWeight,
        overage: s.weight - rules.maxSectorWeight,
        severity: s.weight > rules.maxSectorWeight * 1.25 ? "critical" : "warning",
      });
    }
  }

  return violations.sort((a, b) => b.overage - a.overage);
}

/** Run all rules and return combined violations */
export function runAllRules(
  holdings: ComputedHolding[],
  sectors: SectorSummary[],
  rules: PortfolioRules
): Violation[] {
  return [
    ...checkPositionRules(holdings, rules),
    ...checkSectorRules(sectors, rules),
  ];
}
