// ─── Portfolio Rule Configuration ─────────────────────────────────────────────
// Inspired by Kevin O'Leary's diversification framework.
// Structured for easy future expansion (UI settings, user profiles, etc.)

export interface PortfolioRules {
  /** Maximum weight (%) any single position should hold */
  maxPositionWeight: number;
  /** Maximum weight (%) any single sector should hold */
  maxSectorWeight: number;
  /** Threshold below the limit where we flag "warning" instead of "violation" */
  warningBuffer: number;
  /** Borderline zone for trade simulator (within N% of limit) */
  borderlineThreshold: number;
}

export const DEFAULT_RULES: PortfolioRules = {
  maxPositionWeight: 5,
  maxSectorWeight: 20,
  warningBuffer: 1, // warn at 4%+ for positions, 19%+ for sectors
  borderlineThreshold: 1,
};
