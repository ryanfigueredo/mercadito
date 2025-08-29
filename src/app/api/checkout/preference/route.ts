import { NextRequest, NextResponse } from "next/server";
import { getPreferenceClient } from "@/lib/mercadopago";

export async function POST(req: NextRequest) {
  try {
    const { items, external_reference } = await req.json();
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "items obrigatórios" },
        { status: 400 }
      );
    }

    const preference = await getPreferenceClient().create({
      body: {
        items,
        external_reference,
        back_urls: {
          success: `${
            process.env.NEXTAUTH_URL ?? "http://localhost:3000"
          }/checkout/sucesso`,
          failure: `${
            process.env.NEXTAUTH_URL ?? "http://localhost:3000"
          }/checkout/erro`,
          pending: `${
            process.env.NEXTAUTH_URL ?? "http://localhost:3000"
          }/checkout/pending`,
        },
        auto_return: "approved",
        notification_url: `${
          process.env.NEXTAUTH_URL ?? "http://localhost:3000"
        }/api/checkout/webhook`,
      },
    });

    return NextResponse.json({
      id: preference.id,
      init_point: preference.init_point,
    });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { error: "erro ao criar preferência" },
      { status: 500 }
    );
  }
}
