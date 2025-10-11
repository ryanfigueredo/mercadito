import { prisma } from "./prisma";
import { NotificationType } from "@prisma/client";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
  actionUrl?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        relatedId: params.relatedId,
        actionUrl: params.actionUrl,
      },
    });
    console.log(`📢 Notificação criada: ${params.title}`);
    return notification;
  } catch (error) {
    console.error("Erro ao criar notificação:", error);
    return null;
  }
}

// Funções específicas para cada tipo de notificação

export async function notifyPaymentApproved(
  userId: string,
  orderId: string,
  amount: number
) {
  return createNotification({
    userId,
    type: "PAYMENT_APPROVED",
    title: "Pagamento Aprovado!",
    message: `Seu pagamento de R$ ${(amount / 100).toFixed(
      2
    )} foi aprovado com sucesso. Seu pedido está sendo preparado!`,
    relatedId: orderId,
    actionUrl: `/pedidos`,
  });
}

export async function notifyPaymentFailed(userId: string, orderId: string) {
  return createNotification({
    userId,
    type: "PAYMENT_FAILED",
    title: "Pagamento Recusado",
    message:
      "Não foi possível processar seu pagamento. Por favor, tente outro método de pagamento.",
    relatedId: orderId,
    actionUrl: `/checkout`,
  });
}

export async function notifyOrderConfirmed(
  userId: string,
  orderId: string,
  orderNumber: string
) {
  return createNotification({
    userId,
    type: "ORDER_CONFIRMED",
    title: "Pedido Confirmado!",
    message: `Seu pedido #${orderNumber.slice(
      0,
      8
    )} foi confirmado e está sendo preparado. Em breve sairá para entrega!`,
    relatedId: orderId,
    actionUrl: `/pedidos`,
  });
}

export async function notifyOrderShipped(
  userId: string,
  orderId: string,
  orderNumber: string
) {
  return createNotification({
    userId,
    type: "ORDER_SHIPPED",
    title: "Pedido Saiu para Entrega!",
    message: `Seu pedido #${orderNumber.slice(
      0,
      8
    )} saiu para entrega. Fique atento, logo chegará!`,
    relatedId: orderId,
    actionUrl: `/pedidos`,
  });
}

export async function notifyOrderDelivered(
  userId: string,
  orderId: string,
  orderNumber: string
) {
  return createNotification({
    userId,
    type: "ORDER_DELIVERED",
    title: "Pedido Entregue!",
    message: `Seu pedido #${orderNumber.slice(
      0,
      8
    )} foi entregue. Esperamos que você aproveite! Avalie sua experiência.`,
    relatedId: orderId,
    actionUrl: `/pedidos`,
  });
}

export async function notifyOrderCanceled(
  userId: string,
  orderId: string,
  orderNumber: string,
  reason?: string
) {
  return createNotification({
    userId,
    type: "ORDER_CANCELED",
    title: "Pedido Cancelado",
    message: `Seu pedido #${orderNumber.slice(0, 8)} foi cancelado${
      reason ? `: ${reason}` : "."
    }`,
    relatedId: orderId,
    actionUrl: `/pedidos`,
  });
}

export async function notifyAdminMessage(
  userId: string,
  title: string,
  message: string,
  actionUrl?: string
) {
  return createNotification({
    userId,
    type: "ADMIN_MESSAGE",
    title: title,
    message,
    actionUrl,
  });
}

export async function notifyPromotion(
  userId: string,
  title: string,
  message: string,
  actionUrl?: string
) {
  return createNotification({
    userId,
    type: "PROMOTION",
    title: title,
    message,
    actionUrl,
  });
}
