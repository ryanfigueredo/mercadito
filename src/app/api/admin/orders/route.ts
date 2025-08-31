import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status") || undefined;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.max(
    1,
    Math.min(50, Number(searchParams.get("pageSize") ?? "10"))
  );
  const skip = (page - 1) * pageSize;

  const where = statusParam
    ? {
        status: statusParam as
          | "PENDING"
          | "CONFIRMED"
          | "SHIPPED"
          | "DELIVERED"
          | "CANCELED",
      }
    : {};

  const [orders, total, grouped] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.order.count({ where }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const counts: Record<string, number> = Object.fromEntries(
    grouped.map((g) => [g.status, g._count._all])
  );
  const allCount = await prisma.order.count();

  return NextResponse.json({
    orders,
    page,
    pageSize,
    total,
    counts: { all: allCount, ...counts },
  });
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, action } = await req.json();
    if (!id || !action)
      return NextResponse.json(
        { error: "id e action são obrigatórios" },
        { status: 400 }
      );

    let status: "CONFIRMED" | "CANCELED" | "SHIPPED" | "DELIVERED";
    switch (action) {
      case "accept":
        status = "CONFIRMED";
        break;
      case "reject":
        status = "CANCELED";
        break;
      case "ship":
        status = "SHIPPED";
        break;
      case "deliver":
        status = "DELIVERED";
        break;
      default:
        return NextResponse.json({ error: "action inválida" }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "erro" }, { status: 500 });
  }
}
