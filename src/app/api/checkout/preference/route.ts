import { NextRequest, NextResponse } from "next/server";
import { getPreferenceClient } from "@/lib/mercadopago";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    type RequestItem = {
      productId?: string;
      title: string;
      quantity?: number;
      unit_price: number;
      currency_id?: string;
    };
    const { items } = (await req.json()) as { items: RequestItem[] };
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "items obrigatórios" },
        { status: 400 }
      );
    }

    // DEV: create/find a user to own the order (substituir por usuário logado)
    const user = await prisma.user.upsert({
      where: { email: "dev@mercadito.local" },
      create: {
        email: "dev@mercadito.local",
        name: "Cliente Dev",
        password: "dev",
      },
      update: {},
    });

    // Upsert products by slug (we use client-side id as slug)
    let itemsTotalCents = 0;
    const upserted = await Promise.all(
      items.map(async (it: RequestItem) => {
        const priceCents = Math.round(Number(it.unit_price) * 100);
        itemsTotalCents += priceCents * Number(it.quantity ?? 1);
        const product = await prisma.product.upsert({
          where: { slug: String(it.productId ?? it.title) },
          create: {
            slug: String(it.productId ?? it.title),
            name: String(it.title),
            category: "Diversos",
            priceCents,
          },
          update: {
            name: String(it.title),
            priceCents,
          },
        });
        return {
          productId: product.id,
          quantity: Number(it.quantity ?? 1),
          unitPriceCents: priceCents,
          mpItem: {
            id: String(it.productId ?? it.title),
            title: String(it.title),
            quantity: Number(it.quantity ?? 1),
            currency_id: "BRL",
            unit_price: Number(it.unit_price),
          },
        };
      })
    );

    const freightCents = 2000; // R$20,00
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status: "PENDING",
        totalCents: itemsTotalCents + freightCents,
        items: {
          create: upserted.map((u) => ({
            productId: u.productId,
            quantity: u.quantity,
            unitPriceCents: u.unitPriceCents,
          })),
        },
      },
    });

    const preference = await getPreferenceClient().create({
      body: {
        items: upserted.map((u) => u.mpItem),
        external_reference: order.id,
        back_urls: {
          success: `${
            process.env.NEXTAUTH_URL ?? "http://localhost:3000"
          }/checkout/sucesso`,
          failure: `${
            process.env.NEXTAUTH_URL ?? "http://localhost:3000"
          }/checkout/erro`,
          pending: `${
            process.env.NEXTAUTH_URL ?? "http://localhost:3000"
          }/checkout/pending`,
        },
        auto_return: "approved",
        notification_url: `${
          process.env.NEXTAUTH_URL ?? "http://localhost:3000"
        }/api/checkout/webhook`,
      },
    });

    return NextResponse.json({
      id: preference.id,
      init_point: preference.init_point,
    });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { error: "erro ao criar preferência" },
      { status: 500 }
    );
  }
}
