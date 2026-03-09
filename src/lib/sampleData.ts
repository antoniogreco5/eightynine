import { Holding } from "./types";

export const SAMPLE_HOLDINGS: Omit<Holding, "id">[] = [
  { ticker: "AAPL", shares: 85, avgCost: 142.5, currentPrice: 198.11, sector: "Technology", notes: "Core position, long-term hold" },
  { ticker: "NVDA", shares: 120, avgCost: 48.2, currentPrice: 131.29, sector: "Technology", notes: "AI thesis — trimmed 20% last quarter" },
  { ticker: "MSFT", shares: 28, avgCost: 285, currentPrice: 420.72, sector: "Technology", notes: "" },
  { ticker: "CRM", shares: 30, avgCost: 210, currentPrice: 272.54, sector: "Technology", notes: "Post-earnings add" },
  { ticker: "UNH", shares: 12, avgCost: 480, currentPrice: 521.38, sector: "Healthcare", notes: "" },
  { ticker: "LLY", shares: 8, avgCost: 590, currentPrice: 782.15, sector: "Healthcare", notes: "GLP-1 momentum play" },
  { ticker: "JPM", shares: 35, avgCost: 148, currentPrice: 198.62, sector: "Financials", notes: "" },
  { ticker: "V", shares: 25, avgCost: 230, currentPrice: 282.96, sector: "Financials", notes: "Payments long-term" },
  { ticker: "AMZN", shares: 40, avgCost: 128, currentPrice: 185.07, sector: "Consumer Discretionary", notes: "AWS growth + retail" },
  { ticker: "TSLA", shares: 22, avgCost: 195, currentPrice: 248.42, sector: "Consumer Discretionary", notes: "Volatile — watching closely" },
  { ticker: "XOM", shares: 50, avgCost: 95, currentPrice: 107.36, sector: "Energy", notes: "Dividend anchor" },
  { ticker: "CAT", shares: 15, avgCost: 250, currentPrice: 341.85, sector: "Industrials", notes: "Infrastructure cycle" },
  { ticker: "GOOGL", shares: 30, avgCost: 120, currentPrice: 163.22, sector: "Communication Services", notes: "" },
  { ticker: "PG", shares: 20, avgCost: 145, currentPrice: 165.74, sector: "Consumer Staples", notes: "Defensive position" },
];
