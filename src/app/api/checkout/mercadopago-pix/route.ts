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

    // Calcular total em reais
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

    // Criar cliente Mercado Pago para Checkout Transparente
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { error: "MERCADOPAGO_ACCESS_TOKEN não configurada" },
        { status: 500 }
      );
    }

    const client = new MercadoPagoConfig({
      accessToken: accessToken,
      options: {
        timeout: 5000,
        idempotencyKey: order.id, // Evita duplicatas usando o ID do pedido
      },
    });

    const payment = new Payment(client);

    // Criar pagamento PIX usando Checkout Transparente (API de Pagamentos)
    const paymentData = {
      transaction_amount: totalAmount, // Valor em reais (ex: 5.38)
      description: `Pedido ${order.id}`,
      payment_method_id: "pix",
      payer: {
        email: user.email,
        first_name: user.name.split(" ")[0],
        last_name: user.name.split(" ").slice(1).join(" ") || "",
        identification: {
          type: "CPF",
          number: user.document.replace(/\D/g, ""), // CPF apenas números
        },
      },
      external_reference: order.id, // ID da order no seu sistema
      notification_url: `https://www.seumercadito.com.br/api/checkout/mercadopago-webhook`,
    };

    try {
      const createdPayment = await payment.create({ body: paymentData });

      // Atualizar pedido com ID do pagamento
      await prisma.order.update({
        where: { id: order.id },
        data: {
          mercadopagoPaymentId: createdPayment.id,
          mercadopagoPreferenceId: null,
        },
      });

      // Extrair QR Code da resposta
      const qrCodeBase64 =
        createdPayment.point_of_interaction?.transaction_data?.qr_code_base64;
      const qrCodeText =
        createdPayment.point_of_interaction?.transaction_data?.qr_code;

      if (!qrCodeText && !qrCodeBase64) {
        console.error("QR Code não retornado pelo Mercado Pago");
        return NextResponse.json(
          {
            error: "PIX_NOT_ENABLED",
            message:
              "Chave PIX não habilitada na conta. Entre em contato com o suporte do Mercado Pago para habilitar.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        orderId: order.id,
        paymentId: createdPayment.id,
        pixQrCode: qrCodeText, // Código EMV (copia e cola)
        pixQrCodeUrl: qrCodeBase64
          ? `data:image/jpeg;base64,${qrCodeBase64}`
          : null, // Imagem QR Code em base64
        total: totalAmount,
        expiresIn: 1800, // 30 minutos (padrão PIX)
        status: createdPayment.status,
      });
    } catch (error: any) {
      // Tratamento específico para erro de PIX não habilitado
      if (
        error?.message?.includes("Collector user without key enabled") ||
        error?.error === "bad_request"
      ) {
        return NextResponse.json(
          {
            error: "PIX_NOT_ENABLED",
            message:
              "Chave PIX não habilitada na conta do Mercado Pago. É necessário habilitar a chave PIX nas configurações da conta para usar Checkout Transparente.",
            details:
              "Acesse https://www.mercadopago.com.br/developers e habilite a chave PIX nas configurações da sua conta.",
          },
          { status: 400 }
        );
      }
      throw error; // Re-throw outros erros
    }
  } catch (error: unknown) {
    console.error("Erro no checkout PIX Mercado Pago:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
