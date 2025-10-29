import { NextRequest, NextResponse } from "next/server";

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

    // Para eventos reais, apenas logar por enquanto
    console.log(`🔄 Evento real recebido: ${event.type} - ${event.action}`);

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
