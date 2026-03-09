import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.watchlistItem.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const item = await prisma.watchlistItem.create({
    data: {
      userId: session.user.id,
      ticker: body.ticker,
      sector: body.sector,
      targetShares: body.targetShares ?? 0,
      targetAmount: body.targetAmount ?? 0,
      currentPrice: body.currentPrice ?? 0,
      notes: body.notes ?? "",
    },
  });
  return NextResponse.json({ item });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await prisma.watchlistItem.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ deleted: true });
}
