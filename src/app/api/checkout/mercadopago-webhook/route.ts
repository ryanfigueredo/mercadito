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

    console.log(`🔔 Webhook recebido:`);
    console.log(`   Body: ${body}`);

    const event = JSON.parse(body);

    console.log(`   Evento:`, event);

    // Para eventos de teste, apenas retornar sucesso
    if (event.data?.id === "123456") {
      console.log(`✅ Evento de teste processado`);
      return NextResponse.json({
        received: true,
        message: "Evento de teste processado",
        event_type: event.type,
        event_action: event.action,
      });
    }

    // Para eventos reais, processar normalmente
    switch (event.type) {
      case "payment":
        await handlePaymentEvent(event.data.id, event.action);
        break;
      case "preference":
        await handlePreferenceEvent(event.data.id, event.action);
        break;
      default:
        console.log(`ℹ️ Evento não tratado: ${event.type}`);
    }

    return NextResponse.json({
      received: true,
      message: "Webhook processado com sucesso",
      event_type: event.type,
      event_action: event.action,
    });
  } catch (error: unknown) {
    console.error("❌ Erro no webhook:", error);
    return NextResponse.json(
      {
        error: "Erro ao processar webhook",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

async function handlePaymentEvent(paymentId: string, action: string) {
  try {
    console.log(`🔄 Processando evento de pagamento: ${paymentId} - ${action}`);

    // Buscar detalhes do pagamento no Mercado Pago
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
