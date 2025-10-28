import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Função para enviar venda para AMCSistema
export async function sendSaleToAMC(orderId: string) {
  try {
    // Buscar pedido completo
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error("Pedido não encontrado");
    }

    // Preparar payload para AMCSistema
    const payload = {
      pedido_id: order.id,
      data_venda: order.createdAt.toISOString(),
      cliente: {
        nome: order.user.name,
        email: order.user.email,
        telefone: order.user.phone || "",
      },
      itens: order.items.map((item) => ({
        codigo_produto: item.product.slug, // Usar slug como código
        nome_produto: item.product.name,
        quantidade: item.quantity,
        preco_unitario: item.unitPriceCents / 100,
        preco_total: (item.unitPriceCents * item.quantity) / 100,
      })),
      total_pedido: order.totalCents / 100,
      frete: order.shippingCents / 100,
      status: order.status,
      endereco_entrega: {
        rua: order.deliveryAddress,
        cidade: order.deliveryCity,
        estado: order.deliveryState,
        cep: order.deliveryZip,
      },
    };

    // Enviar para AMCSistema
    const amcWebhookUrl = process.env.AMC_WEBHOOK_URL;
    const amcToken = process.env.AMC_API_TOKEN;

    if (!amcWebhookUrl || !amcToken) {
      console.warn("⚠️ AMC webhook não configurado");
      return;
    }

    const response = await fetch(amcWebhookUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${amcToken}`,
        "Content-Type": "application/json",
        "User-Agent": "MercaditoApp/1.0",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `AMC webhook falhou: ${response.status} ${response.statusText}`
      );
    }

    console.log(`✅ Venda ${orderId} enviada para AMCSistema`);

    return await response.json();
  } catch (error) {
    console.error(`❌ Erro ao enviar venda ${orderId} para AMC:`, error);
    throw error;
  }
}

// Endpoint para testar envio manual
export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId é obrigatório" },
        { status: 400 }
      );
    }

    const result = await sendSaleToAMC(orderId);

    return NextResponse.json({
      message: "Venda enviada para AMCSistema com sucesso",
      result,
    });
  } catch (error) {
    console.error("❌ Erro no teste de envio:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 500 }
    );
  }
}
