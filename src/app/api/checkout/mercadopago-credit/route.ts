import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { items, cardToken, installments, deliveryAddress, shippingInfo } =
      (await req.json()) as {
        items: Array<{
          id: string;
          name: string;
          price: number;
          quantity: number;
        }>;
        cardToken: string;
        installments: number;
        deliveryAddress: {
          street: string;
          city: string;
          state: string;
          zip: string;
        };
        shippingInfo?: {
          rateCents: number;
          rateReais: number;
          distanceKm: number;
          estimatedDays: number;
        };
      };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "items obrigatórios" },
        { status: 400 }
      );
    }

    if (!cardToken) {
      return NextResponse.json(
        { error: "token do cartão obrigatório" },
        { status: 400 }
      );
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json(
        { error: "usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se tem CPF cadastrado
    if (!user.document) {
      return NextResponse.json(
        {
          error: "CPF_REQUIRED",
          message:
            "CPF é obrigatório para pagamento com cartão. Cadastre seu CPF para continuar.",
        },
        { status: 400 }
      );
    }

    // Preparar itens e calcular total (valores em reais)
    let itemsTotalAmount = 0;
    items.forEach((item) => {
      const amount = item.price; // Valor em reais
      const quantity = item.quantity || 1;
      itemsTotalAmount += amount * quantity;
    });

    const freightAmount = (shippingInfo?.rateCents || 0) / 100; // em reais
    const totalAmount = itemsTotalAmount + freightAmount; // em reais

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
        totalCents: Math.round(totalAmount * 100), // Converter para centavos para o banco
        shippingCents: Math.round(freightAmount * 100), // Converter para centavos para o banco
        paymentMethod: "mercadopago_credit",
        deliveryAddress: deliveryAddress.street,
        deliveryCity: deliveryAddress.city,
        deliveryState: deliveryAddress.state,
        deliveryZip: deliveryAddress.zip,
        items: {
          create: items.map((item) => {
            const dbProduct = dbProducts.find((p) => p.slug === item.id)!;
            return {
              productId: dbProduct.id,
              quantity: item.quantity || 1,
              unitPriceCents: Math.round(item.price * 100), // Converter para centavos
            };
          }),
        },
      },
    });

    // Preparar dados do cliente para Mercado Pago
    const phone = user.phone?.replace(/\D/g, "") || "";
    const areaCode = phone.substring(0, 2);
    const number = phone.substring(2);

    // Criar pagamento no Mercado Pago seguindo a documentação oficial
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { error: "MERCADOPAGO_ACCESS_TOKEN não configurado" },
        { status: 500 }
      );
    }
    const mp = new MercadoPagoConfig({ accessToken });
    const paymentClient = new Payment(mp);
    const payment = await paymentClient.create({
      body: {
        transaction_amount: Number(totalAmount.toFixed(2)), // em reais
        description: `Pedido ${order.id}`,
        payment_method_id: "credit_card",
        installments: Math.max(1, Number(installments || 1)),
        token: cardToken,
        payer: {
          email: user.email!,
          identification: {
            type: "CPF",
            number: user.document!.replace(/\D/g, ""),
          },
          first_name: user.name?.split(" ")[0] || "",
          last_name: user.name?.split(" ").slice(1).join(" ") || "",
          phone: phone
            ? {
                area_code: areaCode,
                number: number,
              }
            : undefined,
        },
        external_reference: order.id,
      },
    });

    // Atualizar pedido com ID do pagamento
    await prisma.order.update({
      where: { id: order.id },
      data: {
        mercadopagoPaymentId: String(payment.id), // Converter para string
        mercadopagoPreferenceId: null,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      paymentId: payment.id,
      status: payment.status,
      statusDetail: payment.status_detail,
      total: totalAmount,
      installments: (payment as any).installments,
    });
  } catch (error: unknown) {
    console.error("Erro no checkout cartão Mercado Pago:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
