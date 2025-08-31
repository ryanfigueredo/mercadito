import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  // Seed idempotente para desenvolvimento
  try {
    const user = await prisma.user.upsert({
      where: { email: "dev@mercadito.local" },
      create: {
        email: "dev@mercadito.local",
        name: "Cliente Dev",
        password: "dev",
        addresses: {
          create: {
            label: "Minha Casa",
            street: "Rua das Oliveiras nº 400",
            city: "Jardim Campos",
            state: "SP",
            zip: "00000-000",
          },
        },
      },
      update: {},
      include: { addresses: true },
    });

    // Produtos base
    const produtos = [
      {
        slug: "arroz-camil-5kg",
        name: "Arroz Camil 5kg",
        category: "Grãos",
        priceCents: 2200,
      },
      {
        slug: "feijao-kicaldo-1kg",
        name: "Feijão Kicaldo 1kg",
        category: "Grãos",
        priceCents: 800,
      },
      {
        slug: "carne-picanha-1kg",
        name: "Picanha 1kg",
        category: "Açougue",
        priceCents: 7990,
      },
    ];
    const createdProducts = [] as {
      id: string;
      slug: string;
      priceCents: number;
      name: string;
    }[];
    for (const p of produtos) {
      const pr = await prisma.product.upsert({
        where: { slug: p.slug },
        create: p,
        update: {
          name: p.name,
          category: p.category,
          priceCents: p.priceCents,
        },
      });
      createdProducts.push({
        id: pr.id,
        slug: pr.slug,
        priceCents: pr.priceCents,
        name: pr.name,
      });
    }

    // Pedido atual (pendente)
    const arroz = createdProducts.find((p) => p.slug === "arroz-camil-5kg")!;
    const feijao = createdProducts.find(
      (p) => p.slug === "feijao-kicaldo-1kg"
    )!;
    const freightCents = 2000;
    const itemsValue = arroz.priceCents * 2 + feijao.priceCents * 1;
    await prisma.order.upsert({
      where: { id: "seed-order-current" },
      create: {
        id: "seed-order-current",
        userId: user.id,
        status: "PENDING",
        totalCents: itemsValue + freightCents,
        items: {
          create: [
            {
              productId: (await prisma.product.findUnique({
                where: { slug: arroz.slug },
              }))!.id,
              quantity: 2,
              unitPriceCents: arroz.priceCents,
            },
            {
              productId: (await prisma.product.findUnique({
                where: { slug: feijao.slug },
              }))!.id,
              quantity: 1,
              unitPriceCents: feijao.priceCents,
            },
          ],
        },
      },
      update: { status: "PENDING" },
    });

    // Histórico (entregues)
    for (let i = 1; i <= 2; i++) {
      await prisma.order.upsert({
        where: { id: `seed-order-delivered-${i}` },
        create: {
          id: `seed-order-delivered-${i}`,
          userId: user.id,
          status: "DELIVERED",
          totalCents: itemsValue + freightCents,
          items: {
            create: [
              {
                productId: (await prisma.product.findUnique({
                  where: { slug: arroz.slug },
                }))!.id,
                quantity: 2,
                unitPriceCents: arroz.priceCents,
              },
              {
                productId: (await prisma.product.findUnique({
                  where: { slug: feijao.slug },
                }))!.id,
                quantity: 1,
                unitPriceCents: feijao.priceCents,
              },
            ],
          },
        },
        update: { status: "DELIVERED" },
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "seed failed" }, { status: 500 });
  }
}
