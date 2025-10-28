import { NextRequest, NextResponse } from "next/server";
import { syncAllProductsWithAMC } from "@/lib/amc-integration";

// Endpoint para sincronizar todos os produtos com AMC
export async function POST(req: NextRequest) {
  try {
    const result = await syncAllProductsWithAMC();

    return NextResponse.json({
      message: "Sincronização completa realizada com sucesso",
      result,
    });
  } catch (error) {
    console.error("❌ Erro na sincronização completa:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 500 }
    );
  }
}
