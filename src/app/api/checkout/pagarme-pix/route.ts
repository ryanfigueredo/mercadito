import { NextRequest, NextResponse } from "next/server";
import { getPagarMeClient } from "@/lib/pagarme";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { items, deliveryAddress } = (await req.json()) as {
      items: Array<{
        id: string;
        name: string;
        price: number;
        quantity: number;
      }>;
      deliveryAddress: {
        street: string;
        city: string;
        state: string;
        zip: string;
      };
    };
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "items obrigatórios" },
        { status: 400 }
      );
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "user_not_found" }, { status: 401 });
    }

    // Validar se usuário tem CPF/telefone
    if (!user.document || !user.phone) {
      return NextResponse.json(
        { error: "CPF e telefone são obrigatórios para pagamento PIX" },
        { status: 400 }
      );
    }

    // Preparar itens e calcular total
    let itemsTotalCents = 0;
    const pagarmeItems = items.map((item) => {
      const amount = Math.round(item.price * 100); // converter para centavos
      const quantity = item.quantity || 1;
      itemsTotalCents += amount * quantity;

      return {
        amount,
        description: item.name,
        quantity,
      };
    });

    const freightCents = 2000; // R$20,00 frete fixo
    const totalCents = itemsTotalCents + freightCents;

    // Buscar produtos no banco usando os slugs do carrinho
    const productSlugs = items.map((item) => item.id);
    const dbProducts = await prisma.product.findMany({
      where: { slug: { in: productSlugs } },
    });

    // Validar se todos os produtos existem
    if (dbProducts.length !== items.length) {
      const foundSlugs = dbProducts.map((p) => p.slug);
      const missingSlugs = productSlugs.filter(
        (slug) => !foundSlugs.includes(slug)
      );
      return NextResponse.json(
        { error: `Produtos não encontrados: ${missingSlugs.join(", ")}` },
        { status: 400 }
      );
    }

    // Validar endereço de entrega
    if (
      !deliveryAddress ||
      !deliveryAddress.street ||
      !deliveryAddress.city ||
      !deliveryAddress.state ||
      !deliveryAddress.zip
    ) {
      return NextResponse.json(
        { error: "Endereço de entrega é obrigatório" },
        { status: 400 }
      );
    }

    // Criar pedido no banco
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status: "PENDING",
        totalCents,
        shippingCents: freightCents,
        paymentMethod: "pagarme_pix",
        deliveryAddress: deliveryAddress.street,
        deliveryCity: deliveryAddress.city,
        deliveryState: deliveryAddress.state,
        deliveryZip: deliveryAddress.zip,
        items: {
          create: items.map((item) => {
            const dbProduct = dbProducts.find((p) => p.slug === item.id)!;
            return {
              productId: dbProduct.id, // usar o ID real do banco
              quantity: item.quantity || 1,
              unitPriceCents: Math.round(item.price * 100),
            };
          }),
        },
      },
    });

    // Preparar dados do cliente para Pagar.me
    const phone = user.phone.replace(/\D/g, ""); // remover caracteres não numéricos
    const areaCode = phone.substring(0, 2);
    const number = phone.substring(2);

    // Criar pedido no Pagar.me
    const pagarmeClient = getPagarMeClient();
    const pagarmeOrder = await pagarmeClient.createOrder({
      items: pagarmeItems,
      customer: {
        name: user.name,
        email: user.email,
        type: "individual",
        document: user.document,
        phones: {
          mobile_phone: {
            country_code: "55",
            area_code: areaCode,
            number: number,
          },
        },
      },
      payments: [
        {
          payment_method: "pix",
          pix: {
            expires_in: 3600, // 1 hora
            additional_information: [
              {
                name: "Pedido",
                value: order.id,
              },
            ],
          },
        },
      ],
    });

    // Atualizar pedido com dados do Pagar.me
    const charge = pagarmeOrder.charges?.[0];
    if (charge?.pix) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          pagarmeOrderId: pagarmeOrder.id,
          pagarmeChargeId: charge.id,
          pixQrCode: charge.pix.qr_code,
          pixQrCodeUrl: charge.pix.qr_code_url,
        },
      });
    }

    return NextResponse.json({
      orderId: order.id,
      pixQrCode: charge?.pix?.qr_code,
      pixQrCodeUrl: charge?.pix?.qr_code_url,
      total: totalCents / 100,
      expiresIn: 3600,
    });
  } catch (error: unknown) {
    console.error("Erro ao criar pagamento PIX:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "erro ao processar pagamento PIX",
      },
      { status: 500 }
    );
  }
}
