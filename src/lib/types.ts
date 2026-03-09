// ─── Core Portfolio Types ─────────────────────────────────────────────────────

export interface Holding {
  id: string;
  ticker: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  sector: string;
  notes: string;
}

export interface ComputedHolding extends Holding {
  marketValue: number;
  costBasis: number;
  gainLoss: number;
  gainLossPercent: number;
  weight: number;
  status: HoldingStatus;
  dayChange?: number;
  dayChangePercent?: number;
}

export type HoldingStatus = "healthy" | "warning" | "violation";

export interface SectorSummary {
  name: string;
  totalValue: number;
  weight: number;
  holdingCount: number;
  status: "within-limit" | "above-limit";
  overage: number;
}

export interface Violation {
  type: "position" | "sector";
  label: string;
  currentWeight: number;
  limit: number;
  overage: number;
  severity: "warning" | "critical";
}

export interface Recommendation {
  type: "trim" | "reduce-sector" | "rebalance" | "general";
  message: string;
  ticker?: string;
  sector?: string;
  amountToTrim?: number;
}

export interface SimulatedTrade {
  ticker: string;
  dollarAmount: number;
  sector: string;
}

export interface SimulationResult {
  newPositionWeight: number;
  newSectorWeight: number;
  positionViolation: boolean;
  sectorViolation: boolean;
  positionStatus: "allowed" | "borderline" | "not-recommended";
  sectorStatus: "allowed" | "borderline" | "not-recommended";
  messages: string[];
}

export interface PortfolioSummary {
  totalValue: number;
  holdingCount: number;
  largestHolding: { ticker: string; weight: number };
  largestSector: { name: string; weight: number };
  violationCount: number;
  concentrationScore: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
}

export interface PriceData {
  price: number;
  change: number;
  changePercent: number;
}

export const SECTORS = [
  "Technology",
  "Healthcare",
  "Financials",
  "Consumer Discretionary",
  "Consumer Staples",
  "Energy",
  "Industrials",
  "Materials",
  "Real Estate",
  "Utilities",
  "Communication Services",
  "Cash / Other",
] as const;

export type SectorName = (typeof SECTORS)[number];
