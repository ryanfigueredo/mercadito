import { NextRequest, NextResponse } from "next/server";

// Endpoint para testar conexão com AMC
export async function POST(req: NextRequest) {
  try {
    const { amcWebhookUrl, amcApiUrl, amcApiToken, amcWebhookToken } =
      await req.json();

    if (!amcApiUrl || !amcApiToken) {
      return NextResponse.json(
        { error: "URL da API e Token são obrigatórios" },
        { status: 400 }
      );
    }

    // Testar conexão com API AMC
    const testResponse = await fetch(`${amcApiUrl}/test`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${amcApiToken}`,
        "Content-Type": "application/json",
        "User-Agent": "MercaditoApp/1.0",
      },
    });

    if (!testResponse.ok) {
      throw new Error(
        `API AMC retornou erro: ${testResponse.status} ${testResponse.statusText}`
      );
    }

    const testData = await testResponse.json();

    return NextResponse.json({
      message: "Conexão com AMCSistema estabelecida com sucesso!",
      details: {
        apiUrl: amcApiUrl,
        webhookUrl: amcWebhookUrl,
        status: "connected",
        response: testData,
      },
    });
  } catch (error) {
    console.error("❌ Erro no teste de conexão:", error);
    return NextResponse.json(
      {
        error: "Falha na conexão com AMCSistema",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
