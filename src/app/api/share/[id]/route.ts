import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const report = await prisma.sharedReport.findUnique({
    where: { shareToken: params.id },
    include: { user: { select: { name: true } } },
  });

  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (new Date() > report.expiresAt) return NextResponse.json({ error: "Expired" }, { status: 410 });

  return NextResponse.json({
    portfolioData: JSON.parse(report.portfolioData),
    userName: report.user.name,
    createdAt: report.createdAt,
    expiresAt: report.expiresAt,
  });
}
