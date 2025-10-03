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

    // Usar CPF do banco de dados ou permitir cadastro no checkout
    let documentToUse = user.document;

    // Se não tem CPF cadastrado, permite cadastrar no checkout
    if (!documentToUse) {
      return NextResponse.json(
        {
          error: "CPF_REQUIRED",
          message:
            "CPF é obrigatório para pagamento PIX. Cadastre seu CPF para continuar.",
        },
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

    const freightCents = 0; // R$0,00 frete zerado para testes
    const totalCents = itemsTotalCents + freightCents;

    // Adicionar frete como item separado no Pagar.me (apenas se > 0)
    if (freightCents > 0) {
      pagarmeItems.push({
        amount: freightCents,
        description: "Frete",
        quantity: 1,
      });
    }

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
        document: documentToUse,
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

    // Logs removidos - PIX funcionando corretamente

    // Os dados do PIX estão em last_transaction, não em pix
    const pixData = charge?.last_transaction;
    if (pixData?.qr_code) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          pagarmeOrderId: pagarmeOrder.id,
          pagarmeChargeId: charge!.id,
          pixQrCode: pixData.qr_code,
          pixQrCodeUrl: pixData.qr_code_url,
        },
      });
    }

    return NextResponse.json({
      orderId: order.id,
      pixQrCode: pixData?.qr_code || null,
      pixQrCodeUrl: pixData?.qr_code_url || null,
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
