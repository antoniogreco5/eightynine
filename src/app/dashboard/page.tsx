"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { usePortfolio } from "@/hooks/usePortfolio";
import Header from "@/components/Header";
import SummaryCards from "@/components/SummaryCards";
import ViolationsBanner from "@/components/ViolationsBanner";
import SectorAllocation from "@/components/SectorAllocation";
import HoldingsTable from "@/components/HoldingsTable";
import Recommendations from "@/components/Recommendations";
import MultiTradeSimulator from "@/components/MultiTradeSimulator";
import AddHoldingForm from "@/components/AddHoldingForm";
import CSVImport from "@/components/CSVImport";
import WatchlistPanel from "@/components/WatchlistPanel";
import SnapshotChart from "@/components/SnapshotChart";
import ShareButton from "@/components/ShareButton";

type Tab = "overview" | "holdings" | "simulate" | "watchlist" | "history";

export default function DashboardPage() {
  const { data: session } = useSession();
  const portfolio = usePortfolio();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);

  if (portfolio.loading) {
    return (
      <div className="min-h-screen bg-ambient bg-grid flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-cyan animate-pulse" />
          <p className="text-sm text-surface-600">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "holdings", label: "Holdings", count: portfolio.computedHoldings.length },
    { key: "simulate", label: "Trade Lab" },
    { key: "watchlist", label: "Watchlist" },
    { key: "history", label: "History" },
  ];

  return (
    <div className="min-h-screen bg-ambient bg-grid">
      <Header
        userName={session?.user?.name ?? undefined}
        userImage={session?.user?.image ?? undefined}
        onReset={portfolio.loadSampleData}
        onClear={portfolio.clearAll}
        onExport={portfolio.exportRecommendations}
        onRefreshPrices={portfolio.refreshPrices}
        pricesLoading={portfolio.pricesLoading}
        lastPriceUpdate={portfolio.lastPriceUpdate}
      />

      <main className="max-w-[1440px] mx-auto px-5 sm:px-8 pb-20 relative z-10">
        {/* Summary Cards */}
        <div className="animate-slide-up">
          <SummaryCards summary={portfolio.summary} rules={portfolio.rules} />
        </div>

        {/* Violations */}
        {portfolio.violations.length > 0 && (
          <div className="animate-slide-up stagger-2">
            <ViolationsBanner violations={portfolio.violations} />
          </div>
        )}

        {/* Empty State */}
        {portfolio.holdings.length === 0 && !showAddForm && !showCSVImport && (
          <div className="mt-12 card p-16 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400/20 to-cyan/20 flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl text-gradient font-bold">89</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Start building your portfolio</h2>
            <p className="text-surface-700 text-sm mb-8 max-w-sm mx-auto">
              Add your holdings to see diversification analysis, rule checks, and rebalance recommendations.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button onClick={portfolio.loadSampleData} className="btn-primary">Load Sample Portfolio</button>
              <button onClick={() => { setActiveTab("holdings"); setShowCSVImport(true); }} className="btn-ghost">Import CSV</button>
              <button onClick={() => { setActiveTab("holdings"); setShowAddForm(true); }} className="btn-ghost">Add Manually</button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        {(portfolio.holdings.length > 0 || showAddForm || showCSVImport) && (
          <>
            <div className="flex items-center justify-between mt-10 mb-8 border-b border-surface-300 animate-slide-up stagger-3">
              <div className="flex items-center gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-5 py-3 text-sm font-medium transition-all relative ${
                      activeTab === tab.key ? "text-surface-900" : "text-surface-600 hover:text-surface-700"
                    }`}
                  >
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className={`ml-1.5 text-xs ${activeTab === tab.key ? "text-brand-400" : "text-surface-600"}`}>{tab.count}</span>
                    )}
                    {activeTab === tab.key && (
                      <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-brand-400 to-cyan rounded-full" />
                    )}
                  </button>
                ))}
              </div>
              <ShareButton holdings={portfolio.holdings} />
            </div>

            {/* ─── OVERVIEW TAB ─── */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                <div className="lg:col-span-2 space-y-6">
                  <SectorAllocation sectors={portfolio.sectors} rules={portfolio.rules} />
                  <Recommendations recommendations={portfolio.recommendations} violations={portfolio.violations} />
                </div>
                <div className="space-y-6">
                  <SnapshotChart summary={portfolio.summary} holdingsData={portfolio.holdings} />
                </div>
              </div>
            )}

            {/* ─── HOLDINGS TAB ─── */}
            {activeTab === "holdings" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-surface-600">
                      {portfolio.computedHoldings.length} position{portfolio.computedHoldings.length !== 1 ? "s" : ""} · {portfolio.sectors.length} sectors
                    </p>
                    {portfolio.priceError && (
                      <span className="text-xs text-down px-2 py-0.5 rounded-full bg-down-dim">Price feed unavailable</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setShowCSVImport(!showCSVImport); setShowAddForm(false); }}
                      className={showCSVImport ? "btn-ghost text-sm" : "btn-ghost text-sm"}
                    >
                      {showCSVImport ? "Cancel" : "Import CSV"}
                    </button>
                    <button
                      onClick={() => { setShowAddForm(!showAddForm); setShowCSVImport(false); }}
                      className={showAddForm ? "btn-ghost text-sm" : "btn-primary text-sm !py-2.5 !px-5"}
                    >
                      {showAddForm ? "Cancel" : "+ Add Holding"}
                    </button>
                  </div>
                </div>

                {showCSVImport && (
                  <CSVImport
                    onImport={async (holdings) => {
                      await fetch("/api/portfolio", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ holdings }),
                      });
                      window.location.reload();
                    }}
                    onCancel={() => setShowCSVImport(false)}
                  />
                )}

                {showAddForm && (
                  <AddHoldingForm
                    onAdd={(h) => { portfolio.addHolding(h); setShowAddForm(false); }}
                    onCancel={() => setShowAddForm(false)}
                  />
                )}

                <HoldingsTable
                  holdings={portfolio.computedHoldings}
                  onUpdate={portfolio.updateHolding}
                  onRemove={portfolio.removeHolding}
                />
              </div>
            )}

            {/* ─── TRADE LAB TAB ─── */}
            {activeTab === "simulate" && (
              <div className="animate-fade-in">
                <MultiTradeSimulator
                  computedHoldings={portfolio.computedHoldings}
                  sectors={portfolio.sectors}
                  totalValue={portfolio.totalValue}
                  rules={portfolio.rules}
                />
              </div>
            )}

            {/* ─── WATCHLIST TAB ─── */}
            {activeTab === "watchlist" && (
              <div className="max-w-3xl animate-fade-in">
                <WatchlistPanel
                  totalValue={portfolio.totalValue}
                  computedHoldings={portfolio.computedHoldings}
                  sectors={portfolio.sectors}
                  rules={portfolio.rules}
                />
              </div>
            )}

            {/* ─── HISTORY TAB ─── */}
            {activeTab === "history" && (
              <div className="max-w-3xl animate-fade-in">
                <SnapshotChart summary={portfolio.summary} holdingsData={portfolio.holdings} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
