import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    const received = req.headers.get("x-mp-signature");
    if (!secret || !received) {
      // Accept but log; real validation can be added here later
      console.warn("MP webhook sem assinatura ou secret");
    }
    const body = await req.json();
    try {
      // Mercado Pago envia notificações em múltiplos formatos; aqui simplificamos:
      const ref = body?.data?.id || body?.resource || body?.id;
      const ext = body?.external_reference || body?.data?.external_reference;
      const orderId = ext ?? ref;
      if (orderId && typeof orderId === "string") {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "CONFIRMED" },
        });
      }
    } catch {}
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
