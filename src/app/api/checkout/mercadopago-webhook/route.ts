import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMercadoPagoClient } from "@/lib/mercadopago";
import {
  notifyPaymentApproved,
  notifyPaymentFailed,
  notifyOrderConfirmed,
} from "@/lib/notifications";
import { sendSaleToAMC } from "@/app/api/integration/amc/send-sale/route";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    // Log de debug para identificar requisições
    console.log(`🔍 Webhook recebido:`);
    console.log(`   User Agent: ${req.headers.get("user-agent") || "N/A"}`);
    console.log(`   Content Type: ${req.headers.get("content-type") || "N/A"}`);
    console.log(`   Authorization: ${req.headers.get("authorization") ? "Presente" : "Ausente"}`);
    console.log(`   MP Signature: ${req.headers.get("x-mercadopago-signature") ? "Presente" : "Ausente"}`);

    // Para testes do Mercado Pago, aceitar sem autenticação
    // Para requisições externas, verificar autenticação básica
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Basic ")) {
      const credentials = Buffer.from(
        authHeader.substring(6),
        "base64"
      ).toString();
      const [username, password] = credentials.split(":");

      const expectedUser = process.env.MERCADOPAGO_WEBHOOK_USER || "mercadito";
      const expectedPassword =
        process.env.MERCADOPAGO_WEBHOOK_PASSWORD ||
        "mercadito_webhook_2024_secret_key";

      if (username !== expectedUser || password !== expectedPassword) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }
    }

    const event = JSON.parse(body) as {
      type: string;
      action: string;
      data: { id: string };
      live_mode?: boolean;
      user_id?: number;
    };

    // Log detalhado para debug
    console.log(`🔔 Webhook Mercado Pago recebido:`);
    console.log(`   Tipo: ${event.type}`);
    console.log(`   Ação: ${event.action}`);
    console.log(`   ID: ${event.data.id}`);
    console.log(`   Live Mode: ${event.live_mode || false}`);
    console.log(`   User ID: ${event.user_id || 'N/A'}`);
    console.log(`   É teste MP: ${isMercadoPagoTest}`);
    console.log(`   User Agent: ${userAgent}`);

    // Processar diferentes tipos de eventos
    switch (event.type) {
      case "payment":
        await handlePaymentEvent(event.data.id, event.action);
        break;
      case "preference":
        await handlePreferenceEvent(event.data.id, event.action);
        break;
      default:
        console.log(`Evento não tratado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error("Erro no webhook Mercado Pago:", error);
    return NextResponse.json(
      { error: "Erro ao processar webhook" },
      { status: 500 }
    );
  }
}

async function handlePaymentEvent(paymentId: string, action: string) {
  try {
    // Buscar detalhes do pagamento no Mercado Pago primeiro
    const mercadoPagoClient = getMercadoPagoClient();
    const payment = await mercadoPagoClient.getPayment(paymentId);

    // Buscar pedido pelo external_reference (mais confiável) ou pelo ID do pagamento
    let order = null;

    if (payment.external_reference) {
      order = await prisma.order.findUnique({
        where: { id: payment.external_reference },
      });
    }

    // Fallback: buscar pelo ID do pagamento se external_reference não funcionar
    if (!order) {
      order = await prisma.order.findFirst({
        where: { mercadopagoPaymentId: paymentId },
      });
    }

    if (!order) {
      console.log(`Pedido não encontrado para pagamento ${paymentId}`);
      return;
    }

    switch (action) {
      case "payment.created":
        console.log(`Pagamento ${paymentId} criado para pedido ${order.id}`);
        break;

      case "payment.updated":
        await handlePaymentStatusUpdate(order, payment);
        break;

      case "payment.approved":
        await handlePaymentApproved(order, payment);
        break;

      case "payment.rejected":
        await handlePaymentRejected(order, payment);
        break;

      case "payment.cancelled":
        await handlePaymentCancelled(order, payment);
        break;

      case "payment.refunded":
        await handlePaymentRefunded(order, payment);
        break;

      default:
        console.log(`Ação de pagamento não tratada: ${action}`);
    }
  } catch (error) {
    console.error("Erro ao processar evento de pagamento:", error);
  }
}

async function handlePreferenceEvent(preferenceId: string, action: string) {
  try {
    // Buscar pedido pelo ID da preferência
    const order = await prisma.order.findFirst({
      where: { mercadopagoPreferenceId: preferenceId },
    });

    if (!order) {
      console.log(`Pedido não encontrado para preferência ${preferenceId}`);
      return;
    }

    console.log(
      `Preferência ${preferenceId} atualizada para pedido ${order.id}`
    );
  } catch (error) {
    console.error("Erro ao processar evento de preferência:", error);
  }
}

async function handlePaymentStatusUpdate(order: any, payment: any) {
  try {
    let newStatus = order.status;

    switch (payment.status) {
      case "approved":
        newStatus = "CONFIRMED";
        break;
      case "rejected":
      case "cancelled":
        newStatus = "CANCELED";
        break;
      case "pending":
        newStatus = "PENDING";
        break;
      case "in_process":
        newStatus = "PENDING";
        break;
      case "refunded":
        newStatus = "CANCELED";
        break;
    }

    if (newStatus !== order.status) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: newStatus },
      });

      console.log(`Pedido ${order.id} atualizado para status: ${newStatus}`);
    }
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error);
  }
}

async function handlePaymentApproved(order: any, payment: any) {
  try {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CONFIRMED" },
    });

    console.log(`Pedido ${order.id} confirmado via Mercado Pago`);

    // Criar notificações
    await notifyPaymentApproved(
      order.userId,
      order.id,
      order.totalCents + order.shippingCents
    );
    await notifyOrderConfirmed(order.userId, order.id, order.id);

    // Enviar venda para AMCSistema
    try {
      await sendSaleToAMC(order.id);
      console.log(`✅ Venda ${order.id} enviada para AMCSistema`);
    } catch (amcError) {
      console.error(`❌ Erro ao enviar venda ${order.id} para AMC:`, amcError);
      // Não falhar o webhook por erro na AMC
    }
  } catch (error) {
    console.error("Erro ao processar pagamento aprovado:", error);
  }
}

async function handlePaymentRejected(order: any, payment: any) {
  try {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELED" },
    });

    console.log(`Pedido ${order.id} cancelado por pagamento rejeitado`);

    // Notificar falha no pagamento
    await notifyPaymentFailed(order.userId, order.id);
  } catch (error) {
    console.error("Erro ao processar pagamento rejeitado:", error);
  }
}

async function handlePaymentCancelled(order: any, payment: any) {
  try {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELED" },
    });

    console.log(`Pedido ${order.id} cancelado`);
  } catch (error) {
    console.error("Erro ao processar pagamento cancelado:", error);
  }
}

async function handlePaymentRefunded(order: any, payment: any) {
  try {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELED" },
    });

    console.log(`Pedido ${order.id} estornado`);
  } catch (error) {
    console.error("Erro ao processar estorno:", error);
  }
}
