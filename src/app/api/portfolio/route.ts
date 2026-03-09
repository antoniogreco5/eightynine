import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ─── GET: Load all holdings for the authenticated user ────────────────────────
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const holdings = await prisma.holding.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ holdings });
}

// ─── POST: Add a new holding OR bulk-save (for sample data) ───────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Bulk save (for loading sample data)
  if (Array.isArray(body.holdings)) {
    // Clear existing holdings first
    await prisma.holding.deleteMany({ where: { userId: session.user.id } });
    // Insert all
    const created = await prisma.holding.createMany({
      data: body.holdings.map((h: { ticker: string; shares: number; avgCost: number; currentPrice?: number; sector: string; notes?: string }) => ({
        userId: session.user.id,
        ticker: h.ticker,
        shares: h.shares,
        avgCost: h.avgCost,
        currentPrice: h.currentPrice ?? 0,
        sector: h.sector,
        notes: h.notes ?? "",
      })),
    });
    return NextResponse.json({ count: created.count });
  }

  // Single holding add
  const holding = await prisma.holding.create({
    data: {
      userId: session.user.id,
      ticker: body.ticker,
      shares: body.shares,
      avgCost: body.avgCost,
      currentPrice: body.currentPrice ?? 0,
      sector: body.sector,
      notes: body.notes ?? "",
    },
  });

  return NextResponse.json({ holding });
}

// ─── PUT: Update a holding ────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, ...updates } = body;

  // Batch price update
  if (Array.isArray(body.priceUpdates)) {
    for (const pu of body.priceUpdates) {
      await prisma.holding.updateMany({
        where: { id: pu.id, userId: session.user.id },
        data: { currentPrice: pu.currentPrice },
      });
    }
    return NextResponse.json({ updated: body.priceUpdates.length });
  }

  const holding = await prisma.holding.updateMany({
    where: { id, userId: session.user.id },
    data: updates,
  });

  return NextResponse.json({ holding });
}

// ─── DELETE: Remove a holding ─────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();

  // Delete all (clear portfolio)
  if (id === "all") {
    await prisma.holding.deleteMany({ where: { userId: session.user.id } });
    return NextResponse.json({ cleared: true });
  }

  await prisma.holding.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ deleted: true });
}
