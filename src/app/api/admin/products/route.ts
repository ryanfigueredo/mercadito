import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bodySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  category: z.string().min(2),
  price: z.number().positive(),
  imageUrl: z.string().url().optional(),
  promoText: z.string().optional(),
});

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const p = parsed.data;
    const created = await prisma.product.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        name: p.name,
        category: p.category,
        priceCents: Math.round(p.price * 100),
        imageUrl: p.imageUrl,
        promoText: p.promoText,
      },
      update: {
        name: p.name,
        category: p.category,
        priceCents: Math.round(p.price * 100),
        imageUrl: p.imageUrl,
        promoText: p.promoText,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug)
    return NextResponse.json({ error: "slug requerido" }, { status: 400 });
  await prisma.product.delete({ where: { slug } });
  return NextResponse.json({ ok: true });
}
