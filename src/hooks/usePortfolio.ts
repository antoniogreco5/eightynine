"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Holding, ComputedHolding, SectorSummary, PortfolioSummary, Violation, Recommendation, SimulatedTrade, SimulationResult, PriceData } from "@/lib/types";
import { DEFAULT_RULES, PortfolioRules } from "@/lib/config";
import { calcTotalValue, computeAllHoldings, computeSectors, computeSummary } from "@/lib/calculations";
import { runAllRules } from "@/lib/rules";
import { generateRecommendations, simulateTrade } from "@/lib/recommendations";
import { SAMPLE_HOLDINGS } from "@/lib/sampleData";

export function usePortfolio() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [rules] = useState<PortfolioRules>(DEFAULT_RULES);
  const [loading, setLoading] = useState(true);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<Date | null>(null);
  const [priceError, setPriceError] = useState(false);
  const hasFetched = useRef(false);

  // ─── Load Holdings from DB ──────────────────────────────────────────────
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadHoldings();
  }, []);

  const loadHoldings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/portfolio");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setHoldings(data.holdings ?? []);
      // Fetch live prices after loading holdings
      if (data.holdings?.length > 0) {
        fetchPrices(data.holdings);
      }
    } catch {
      setHoldings([]);
    } finally {
      setLoading(false);
    }
  };

  // ─── Live Price Fetching ────────────────────────────────────────────────
  const fetchPrices = useCallback(async (holdingsToPrice?: Holding[]) => {
    const h = holdingsToPrice ?? holdings;
    if (h.length === 0) return;
    setPricesLoading(true);
    setPriceError(false);

    try {
      const symbols = [...new Set(h.map((x) => x.ticker))].join(",");
      const res = await fetch(`/api/prices?symbols=${symbols}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const prices: Record<string, PriceData> = data.prices ?? {};

      // Update local state with live prices
      setHoldings((prev) =>
        prev.map((holding) => {
          const priceData = prices[holding.ticker.toUpperCase()];
          if (priceData?.price) {
            return { ...holding, currentPrice: priceData.price };
          }
          return holding;
        })
      );

      // Persist updated prices to DB
      const priceUpdates = Object.entries(prices)
        .map(([sym, pd]) => {
          const match = h.find((x) => x.ticker.toUpperCase() === sym);
          return match ? { id: match.id, currentPrice: pd.price } : null;
        })
        .filter(Boolean);

      if (priceUpdates.length > 0) {
        fetch("/api/portfolio", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priceUpdates }),
        }).catch(() => {}); // fire and forget
      }

      setLastPriceUpdate(new Date());
    } catch {
      setPriceError(true);
    } finally {
      setPricesLoading(false);
    }
  }, [holdings]);

  // ─── Derived State ──────────────────────────────────────────────────────
  const totalValue = useMemo(() => calcTotalValue(holdings), [holdings]);
  const computedHoldings: ComputedHolding[] = useMemo(() => computeAllHoldings(holdings, rules), [holdings, rules]);
  const sectors: SectorSummary[] = useMemo(() => computeSectors(computedHoldings, totalValue, rules), [computedHoldings, totalValue, rules]);
  const summary: PortfolioSummary = useMemo(() => computeSummary(computedHoldings, sectors, totalValue), [computedHoldings, sectors, totalValue]);
  const violations: Violation[] = useMemo(() => runAllRules(computedHoldings, sectors, rules), [computedHoldings, sectors, rules]);
  const recommendations: Recommendation[] = useMemo(() => generateRecommendations(violations, computedHoldings, sectors, totalValue, rules), [violations, computedHoldings, sectors, totalValue, rules]);

  // ─── Actions ────────────────────────────────────────────────────────────
  const addHolding = useCallback(async (holding: Omit<Holding, "id">) => {
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(holding),
      });
      const data = await res.json();
      if (data.holding) {
        setHoldings((prev) => [...prev, data.holding]);
        // Fetch live price for the new ticker
        fetchPrices([...holdings, data.holding]);
      }
    } catch {}
  }, [holdings, fetchPrices]);

  const updateHolding = useCallback(async (id: string, updates: Partial<Holding>) => {
    setHoldings((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)));
    try {
      await fetch("/api/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
    } catch {}
  }, []);

  const removeHolding = useCallback(async (id: string) => {
    setHoldings((prev) => prev.filter((h) => h.id !== id));
    try {
      await fetch("/api/portfolio", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch {}
  }, []);

  const loadSampleData = useCallback(async () => {
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdings: SAMPLE_HOLDINGS }),
      });
      if (res.ok) {
        await loadHoldings();
      }
    } catch {}
  }, []);

  const clearAll = useCallback(async () => {
    setHoldings([]);
    try {
      await fetch("/api/portfolio", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "all" }),
      });
    } catch {}
  }, []);

  const runSimulation = useCallback((trade: SimulatedTrade): SimulationResult => {
    return simulateTrade(trade, computedHoldings, sectors, totalValue, rules);
  }, [computedHoldings, sectors, totalValue, rules]);

  const exportRecommendations = useCallback((): string => {
    const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
    const lines = [
      "═══ EightyNine — Portfolio Analysis ═══",
      `Generated: ${new Date().toLocaleDateString()}`,
      `Portfolio Value: ${fmt(totalValue)}`,
      `Holdings: ${summary.holdingCount} | Violations: ${summary.violationCount} | Score: ${summary.concentrationScore}/100`,
      "",
      "── Violations ──",
      ...violations.map((v) => `• ${v.label}: ${v.currentWeight.toFixed(1)}% (limit: ${v.limit}%, over by ${v.overage.toFixed(1)}%)`),
      "",
      "── Recommendations ──",
      ...recommendations.map((r) => `• ${r.message}`),
    ];
    return lines.join("\n");
  }, [totalValue, summary, violations, recommendations]);

  return {
    holdings, rules, loading, pricesLoading, priceError, lastPriceUpdate,
    totalValue, computedHoldings, sectors, summary, violations, recommendations,
    addHolding, updateHolding, removeHolding, loadSampleData, clearAll,
    runSimulation, exportRecommendations, refreshPrices: () => fetchPrices(),
  };
}
