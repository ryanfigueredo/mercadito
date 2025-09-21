import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const {
      items,
      totalCents,
      shippingCents,
      deliveryAddress,
      deliveryCity,
      deliveryState,
      deliveryZip,
    } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Itens do pedido são obrigatórios" },
        { status: 400 }
      );
    }

    if (!deliveryAddress || !deliveryCity || !deliveryState || !deliveryZip) {
      return NextResponse.json(
        { error: "Endereço de entrega é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se todos os produtos existem e têm estoque
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "Alguns produtos não foram encontrados" },
        { status: 400 }
      );
    }

    // Verificar estoque
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Produto não encontrado: ${item.productId}` },
          { status: 400 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Estoque insuficiente para ${product.name}` },
          { status: 400 }
        );
      }
    }

    // Criar o pedido
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalCents: totalCents,
        shippingCents: shippingCents || 2000,
        paymentMethod: "delivery",
        deliveryAddress: deliveryAddress,
        deliveryCity: deliveryCity,
        deliveryState: deliveryState,
        deliveryZip: deliveryZip,
        status: "PENDING",
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPriceCents: item.unitPriceCents,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Atualizar estoque dos produtos
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        totalCents: order.totalCents,
        shippingCents: order.shippingCents,
        paymentMethod: order.paymentMethod,
        deliveryAddress: order.deliveryAddress,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
