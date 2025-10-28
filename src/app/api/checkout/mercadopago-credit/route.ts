import { NextRequest, NextResponse } from "next/server";
import { getMercadoPagoClient } from "@/lib/mercadopago";
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

    // Preparar itens e calcular total
    let itemsTotalCents = 0;
    const mercadoPagoItems = items.map((item, index) => {
      const amount = Math.round(item.price * 100);
      const quantity = item.quantity || 1;
      itemsTotalCents += amount * quantity;

      return {
        id: item.id || `item_${index + 1}`,
        title: item.name,
        description: item.name,
        quantity,
        unit_price: amount,
        currency_id: "BRL",
      };
    });

    const freightCents = shippingInfo?.rateCents || 0;
    const totalCents = itemsTotalCents + freightCents;

    // Adicionar frete como item separado (apenas se > 0)
    if (freightCents > 0) {
      mercadoPagoItems.push({
        id: "frete",
        title: "Frete",
        description: "Frete",
        quantity: 1,
        unit_price: freightCents,
        currency_id: "BRL",
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
              unitPriceCents: Math.round(item.price * 100),
            };
          }),
        },
      },
    });

    // Preparar dados do cliente para Mercado Pago
    const phone = user.phone?.replace(/\D/g, "") || "";
    const areaCode = phone.substring(0, 2);
    const number = phone.substring(2);

    // Criar pagamento no Mercado Pago
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
    };

    const payment = await mercadoPagoClient.createPayment(paymentData);

    // Atualizar pedido com ID do pagamento
    await prisma.order.update({
      where: { id: order.id },
      data: {
        mercadopagoPaymentId: payment.id,
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
