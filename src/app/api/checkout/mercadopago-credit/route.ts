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

    const { items, cardData, deliveryAddress, shippingInfo } =
      (await req.json()) as {
        items: Array<{
          id: string;
          name: string;
          price: number;
          quantity: number;
        }>;
        cardData: {
          number: string;
          holderName: string;
          expMonth: string;
          expYear: string;
          cvv: string;
          installments: number;
          billingAddress?: {
            line1: string;
            zipCode: string;
            city: string;
            state: string;
          };
        };
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

    if (!cardData) {
      return NextResponse.json(
        { error: "dados do cartão obrigatórios" },
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

    const freightAmount = (shippingInfo?.rateCents || 0) / 100; // Converter centavos para reais
    const totalAmount = itemsTotalAmount + freightAmount;

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
    const mercadoPagoClient = getMercadoPagoClient();

    const paymentData = {
      transaction_amount: totalCents / 100,
      description: `Pedido ${order.id}`,
      payment_method_id: "credit_card",
      payer: {
        email: user.email,
        identification: {
          type: "CPF",
          number: user.document.replace(/\D/g, ""),
        },
        first_name: user.name.split(" ")[0],
        last_name: user.name.split(" ").slice(1).join(" ") || "",
        phone: phone
          ? {
              area_code: areaCode,
              number: number,
            }
          : undefined,
      },
      installments: cardData.installments,
      token: cardData.number.replace(/\s/g, ""),
      issuer_id: undefined,
      external_reference: order.id, // Referência externa para sincronização
    };

    const payment = await mercadoPagoClient.createPayment(paymentData);

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
      total: totalCents / 100,
      installments: payment.installments,
    });
  } catch (error: unknown) {
    console.error("Erro no checkout cartão Mercado Pago:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
