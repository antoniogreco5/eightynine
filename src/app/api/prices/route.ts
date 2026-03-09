import { NextRequest, NextResponse } from "next/server";

// ─── Server-side price cache ──────────────────────────────────────────────────
const priceCache = new Map<string, { price: number; change: number; changePercent: number; timestamp: number }>();
const CACHE_TTL = 60_000; // 60 seconds

export async function GET(req: NextRequest) {
  const symbols = req.nextUrl.searchParams.get("symbols")?.split(",").filter(Boolean) ?? [];

  if (symbols.length === 0) {
    return NextResponse.json({ error: "No symbols provided" }, { status: 400 });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FINNHUB_API_KEY not configured" }, { status: 503 });
  }

  const results: Record<string, { price: number; change: number; changePercent: number }> = {};
  const toFetch: string[] = [];

  // Check cache first
  for (const sym of symbols) {
    const cached = priceCache.get(sym.toUpperCase());
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      results[sym.toUpperCase()] = {
        price: cached.price,
        change: cached.change,
        changePercent: cached.changePercent,
      };
    } else {
      toFetch.push(sym.toUpperCase());
    }
  }

  // Fetch uncached symbols from Finnhub (batch with Promise.all, max 10 concurrent)
  const batchSize = 10;
  for (let i = 0; i < toFetch.length; i += batchSize) {
    const batch = toFetch.slice(i, i + batchSize);
    const promises = batch.map(async (sym) => {
      try {
        const res = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${sym}&token=${apiKey}`,
          { next: { revalidate: 60 } }
        );
        const data = await res.json();
        if (data.c && data.c > 0) {
          const entry = {
            price: data.c,
            change: data.d ?? 0,
            changePercent: data.dp ?? 0,
            timestamp: Date.now(),
          };
          priceCache.set(sym, entry);
          results[sym] = { price: entry.price, change: entry.change, changePercent: entry.changePercent };
        }
      } catch {
        // Skip failed fetches silently
      }
    });
    await Promise.all(promises);
  }

  return NextResponse.json({ prices: results, timestamp: Date.now() });
}
