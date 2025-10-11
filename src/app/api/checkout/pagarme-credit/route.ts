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
      return NextResponse.json({ error: "user_not_found" }, { status: 401 });
    }

    // Validar se usuário tem CPF/telefone
    if (!user.document || !user.phone) {
      return NextResponse.json(
        { error: "CPF e telefone são obrigatórios para pagamento com cartão" },
        { status: 400 }
      );
    }

    // Preparar itens e calcular total
    let itemsTotalCents = 0;
    const pagarmeItems = items.map((item, index) => {
      const amount = Math.round(item.price * 100); // converter para centavos
      const quantity = item.quantity || 1;
      itemsTotalCents += amount * quantity;

      return {
        code: item.id || `item_${index + 1}`, // Adicionar código obrigatório
        amount,
        description: item.name,
        quantity,
      };
    });

    const freightCents = shippingInfo?.rateCents || 0; // Usar frete calculado ou R$0,00
    const totalCents = itemsTotalCents + freightCents;

    // Adicionar frete como item separado no Pagar.me (apenas se > 0)
    if (freightCents > 0) {
      pagarmeItems.push({
        code: "frete",
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
        paymentMethod: "pagarme_credit",
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

    // Usar CPF do banco de dados ou permitir cadastro no checkout
    let documentToUse = user.document;

    // Se não tem CPF cadastrado, permite cadastrar no checkout
    if (!documentToUse) {
      return NextResponse.json(
        {
          error: "CPF_REQUIRED",
          message:
            "CPF é obrigatório para pagamento com cartão. Cadastre seu CPF para continuar.",
        },
        { status: 400 }
      );
    }

    // Preparar dados do cliente para Pagar.me
    const phone = user.phone.replace(/\D/g, ""); // remover caracteres não numéricos
    const areaCode = phone.substring(0, 2);
    const number = phone.substring(2);

    // Criar pedido no Pagar.me
    const pagarmeClient = getPagarMeClient();

    const pagarmePayload = {
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
          payment_method: "credit_card",
          credit_card: {
            installments: cardData.installments || 1,
            statement_descriptor: "MERCADITO",
            operation_type: "auth_and_capture",
            card: {
              number: cardData.number,
              holder_name: cardData.holderName,
              exp_month: parseInt(cardData.expMonth),
              exp_year: parseInt(cardData.expYear),
              cvv: cardData.cvv,
              billing_address: cardData.billingAddress
                ? {
                    line_1: cardData.billingAddress.line1,
                    zip_code: cardData.billingAddress.zipCode,
                    city: cardData.billingAddress.city,
                    state: cardData.billingAddress.state,
                    country: "BR",
                  }
                : undefined,
            },
          },
        },
      ],
    };

    console.log("=== ENVIANDO PARA PAGAR.ME ===");
    console.log("Payload:", JSON.stringify(pagarmePayload, null, 2));

    const pagarmeOrder = await pagarmeClient.createOrder(pagarmePayload);

    console.log("=== RESPOSTA PAGAR.ME ===");
    console.log("Order criado:", JSON.stringify(pagarmeOrder, null, 2));

    // Atualizar pedido com dados do Pagar.me
    const charge = pagarmeOrder.charges?.[0];
    if (charge) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          pagarmeOrderId: pagarmeOrder.id,
          pagarmeChargeId: charge.id,
          status: charge.status === "paid" ? "CONFIRMED" : "PENDING",
        },
      });
    }

    return NextResponse.json({
      orderId: order.id,
      status: charge?.status,
      total: totalCents / 100,
      chargeId: charge?.id,
    });
  } catch (error: unknown) {
    console.error("Erro ao processar pagamento com cartão:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "erro ao processar pagamento com cartão",
      },
      { status: 500 }
    );
  }
}
