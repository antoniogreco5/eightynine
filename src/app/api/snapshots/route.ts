import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const snapshots = await prisma.snapshot.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      totalValue: true,
      holdingCount: true,
      violationCount: true,
      concentrationScore: true,
      topHolding: true,
      topHoldingWeight: true,
      topSector: true,
      topSectorWeight: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ snapshots });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const snapshot = await prisma.snapshot.create({
    data: {
      userId: session.user.id,
      totalValue: body.totalValue,
      holdingCount: body.holdingCount,
      violationCount: body.violationCount,
      concentrationScore: body.concentrationScore,
      topHolding: body.topHolding,
      topHoldingWeight: body.topHoldingWeight,
      topSector: body.topSector,
      topSectorWeight: body.topSectorWeight,
      holdingsData: JSON.stringify(body.holdingsData ?? []),
    },
  });
  return NextResponse.json({ snapshot });
}
