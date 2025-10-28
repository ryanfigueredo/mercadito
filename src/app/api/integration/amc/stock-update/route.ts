import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Webhook para receber atualizações de estoque da AMCSistema
export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token de autenticação obrigatório" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    // TODO: Validar token com AMCSistema
    if (token !== process.env.AMC_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const body = await req.json();

    // Validar payload
    const {
      codigo_produto,
      nome_produto,
      categoria,
      preco,
      estoque_atual,
      data_atualizacao,
      acao,
    } = body;

    if (
      !codigo_produto ||
      !nome_produto ||
      !categoria ||
      preco === undefined ||
      estoque_atual === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Campos obrigatórios: codigo_produto, nome_produto, categoria, preco, estoque_atual",
        },
        { status: 400 }
      );
    }

    // Buscar produto existente pelo código
    const existingProduct = await prisma.product.findUnique({
      where: { slug: codigo_produto },
    });

    if (acao === "delete") {
      if (existingProduct) {
        await prisma.product.delete({
          where: { id: existingProduct.id },
        });

        console.log(`✅ Produto ${codigo_produto} removido`);
        return NextResponse.json({ message: "Produto removido com sucesso" });
      }
      return NextResponse.json({ message: "Produto não encontrado" });
    }

    // Atualizar ou criar produto
    const productData = {
      slug: codigo_produto,
      name: nome_produto,
      category: categoria,
      priceCents: Math.round(preco * 100), // Converter para centavos
      stock: Math.max(0, estoque_atual), // Não permitir estoque negativo
    };

    const product = await prisma.product.upsert({
      where: { slug: codigo_produto },
      create: productData,
      update: productData,
    });

    console.log(`✅ Produto ${codigo_produto} sincronizado: ${acao}`);

    return NextResponse.json({
      message: "Produto sincronizado com sucesso",
      product: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        stock: product.stock,
        price: product.priceCents / 100,
      },
    });
  } catch (error) {
    console.error("❌ Erro na sincronização AMC:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Endpoint para consultar status da integração
export async function GET() {
  try {
    const totalProducts = await prisma.product.count();
    const lowStockProducts = await prisma.product.count({
      where: { stock: { lte: 5 } },
    });
    const outOfStockProducts = await prisma.product.count({
      where: { stock: { lte: 0 } },
    });

    return NextResponse.json({
      status: "active",
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      lastSync: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Erro ao consultar status:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
