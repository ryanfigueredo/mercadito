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

    const { items, deliveryAddress, shippingInfo } = (await req.json()) as {
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
            "CPF é obrigatório para pagamento PIX. Cadastre seu CPF para continuar.",
        },
        { status: 400 }
      );
    }

    // Preparar itens e calcular total
    let itemsTotalCents = 0;
    const mercadoPagoItems = items.map((item, index) => {
      const amount = Math.round(item.price * 100); // converter para centavos
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
        paymentMethod: "mercadopago_pix",
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

    // Criar preferência no Mercado Pago seguindo a documentação oficial
    const mercadoPagoClient = getMercadoPagoClient();

    const preferenceData = {
      items: mercadoPagoItems,
      payer: {
        name: user.name,
        email: user.email,
        identification: {
          type: "CPF",
          number: user.document.replace(/\D/g, ""),
        },
        phone: phone
          ? {
              area_code: areaCode,
              number: number,
            }
          : undefined,
      },
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [{ id: "credit_card" }, { id: "debit_card" }],
        installments: 1, // PIX sempre à vista
      },
      back_urls: {
        success: `https://www.seumercadito.com.br/checkout/success`,
        failure: `https://www.seumercadito.com.br/checkout/failure`,
        pending: `https://www.seumercadito.com.br/checkout/pending`,
      },
      auto_return: "approved",
      notification_url: `https://www.seumercadito.com.br/api/checkout/mercadopago-webhook`,
      external_reference: order.id, // Referência externa para sincronização
    };

    const preference = await mercadoPagoClient.createPreference(preferenceData);

    // Atualizar pedido com ID da preferência
    await prisma.order.update({
      where: { id: order.id },
      data: {
        mercadopagoPreferenceId: preference.id,
        mercadopagoPaymentId: null,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
      // Para Checkout Pro, não temos QR Code na preferência
      // O QR Code será gerado quando o usuário acessar o init_point
      pixQrCode: null,
      pixQrCodeUrl: null,
      total: totalCents / 100,
      expiresIn: 3600, // 1 hora
      checkoutUrl: preference.init_point, // URL para redirecionar o usuário
    });
  } catch (error: unknown) {
    console.error("Erro no checkout PIX Mercado Pago:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
