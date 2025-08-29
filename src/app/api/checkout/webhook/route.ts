import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    const received = req.headers.get("x-mp-signature");
    if (!secret || !received) {
      // Accept but log; real validation can be added here later
      console.warn("MP webhook sem assinatura ou secret");
    }
    const body = await req.json();
    console.log("MP webhook:", body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
