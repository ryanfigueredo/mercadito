import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    // const signature = req.headers.get("x-pagarme-signature");

    // Verificar autenticação básica
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Basic ")) {
      return NextResponse.json(
        { error: "Missing authorization" },
        { status: 401 }
      );
    }

    const credentials = Buffer.from(
      authHeader.substring(6),
      "base64"
    ).toString();
    const [username, password] = credentials.split(":");

    const expectedUser = process.env.PAGARME_WEBHOOK_USER || "mercadito";
    const expectedPassword =
      process.env.PAGARME_WEBHOOK_PASSWORD ||
      "mercadito_webhook_2024_secret_key";

    if (username !== expectedUser || password !== expectedPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const event = JSON.parse(body) as {
      type: string;
      data: { id: string; status: string };
    };

    // Processar diferentes tipos de eventos
    switch (event.type) {
      case "charge.paid":
        await handleChargePaid(event.data);
        break;
      case "charge.payment_failed":
        await handleChargeFailed(event.data);
        break;
      case "charge.partial_canceled":
        await handleChargeCanceled(event.data);
        break;
      case "charge.antifraud_approved":
        await handleChargeAntifraudApproved(event.data);
        break;
      case "charge.antifraud_reproved":
        await handleChargeAntifraudReproved(event.data);
        break;
      case "charge.antifraud_manual":
        await handleChargeAntifraudManual(event.data);
        break;
      case "charge.pending":
        await handleChargePending(event.data);
        break;
      case "charge.processing":
        await handleChargeProcessing(event.data);
        break;
      case "charge.refunded":
        await handleChargeRefunded(event.data);
        break;
      default:
        console.log(`Evento não tratado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error("Erro no webhook Pagar.me:", error);
    return NextResponse.json(
      { error: "Erro ao processar webhook" },
      { status: 500 }
    );
  }
}

async function handleChargePaid(charge: { id: string; status: string }) {
  try {
    // Buscar pedido pelo ID da cobrança
    const order = await prisma.order.findFirst({
      where: { pagarmeChargeId: charge.id },
    });

    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "CONFIRMED" },
      });

      console.log(`Pedido ${order.id} confirmado via Pagar.me`);
    }
  } catch (error) {
    console.error("Erro ao processar cobrança paga:", error);
  }
}

async function handleChargeFailed(charge: { id: string; status: string }) {
  try {
    const order = await prisma.order.findFirst({
      where: { pagarmeChargeId: charge.id },
    });

    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "CANCELED" },
      });

      console.log(`Pedido ${order.id} cancelado por falha no pagamento`);
    }
  } catch (error) {
    console.error("Erro ao processar cobrança falhada:", error);
  }
}

async function handleChargeCanceled(charge: { id: string; status: string }) {
  try {
    const order = await prisma.order.findFirst({
      where: { pagarmeChargeId: charge.id },
    });

    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "CANCELED" },
      });

      console.log(`Pedido ${order.id} cancelado parcialmente`);
    }
  } catch (error) {
    console.error("Erro ao processar cobrança cancelada:", error);
  }
}

async function handleChargeAntifraudApproved(charge: {
  id: string;
  status: string;
}) {
  try {
    const order = await prisma.order.findFirst({
      where: { pagarmeChargeId: charge.id },
    });

    if (order) {
      // Antifraude aprovado - manter status atual ou confirmar se já pago
      console.log(`Antifraude aprovado para pedido ${order.id}`);
    }
  } catch (error) {
    console.error("Erro ao processar antifraude aprovado:", error);
  }
}

async function handleChargeAntifraudReproved(charge: {
  id: string;
  status: string;
}) {
  try {
    const order = await prisma.order.findFirst({
      where: { pagarmeChargeId: charge.id },
    });

    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "CANCELED" },
      });

      console.log(`Pedido ${order.id} cancelado por antifraude`);
    }
  } catch (error) {
    console.error("Erro ao processar antifraude reprovado:", error);
  }
}

async function handleChargeAntifraudManual(charge: {
  id: string;
  status: string;
}) {
  try {
    const order = await prisma.order.findFirst({
      where: { pagarmeChargeId: charge.id },
    });

    if (order) {
      // Análise manual - manter como pendente
      console.log(`Pedido ${order.id} em análise manual de antifraude`);
    }
  } catch (error) {
    console.error("Erro ao processar análise manual:", error);
  }
}

async function handleChargePending(charge: { id: string; status: string }) {
  try {
    const order = await prisma.order.findFirst({
      where: { pagarmeChargeId: charge.id },
    });

    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "PENDING" },
      });

      console.log(`Pedido ${order.id} pendente de pagamento`);
    }
  } catch (error) {
    console.error("Erro ao processar cobrança pendente:", error);
  }
}

async function handleChargeProcessing(charge: { id: string; status: string }) {
  try {
    const order = await prisma.order.findFirst({
      where: { pagarmeChargeId: charge.id },
    });

    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "PENDING" }, // ou criar status PROCESSING
      });

      console.log(`Pedido ${order.id} em processamento`);
    }
  } catch (error) {
    console.error("Erro ao processar cobrança em processamento:", error);
  }
}

async function handleChargeRefunded(charge: { id: string; status: string }) {
  try {
    const order = await prisma.order.findFirst({
      where: { pagarmeChargeId: charge.id },
    });

    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "CANCELED" }, // ou criar status REFUNDED
      });

      console.log(`Pedido ${order.id} estornado`);
    }
  } catch (error) {
    console.error("Erro ao processar estorno:", error);
  }
}
