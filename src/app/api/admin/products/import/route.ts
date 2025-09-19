import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as XLSX from "xlsx";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Arquivo não fornecido" },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet) as Array<
      Record<string, unknown>
    >;

    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      return NextResponse.json(
        { error: "Arquivo vazio ou inválido" },
        { status: 400 }
      );
    }

    // Mapear colunas do Excel para campos do produto
    const products = jsonData
      .map((row: Record<string, unknown>, index: number) => {
        // Mapear colunas baseado no que você mostrou: Código, Descrição, Und, Estoque, Preço
        const code = String(
          row["Código"] || row["codigo"] || row["CODIGO"] || String(index + 1)
        );
        const description = String(
          row["Descrição"] || row["descricao"] || row["DESCRICAO"] || ""
        );
        const unit = String(row["Und"] || row["und"] || row["UND"] || "UN");
        const stock = parseInt(
          String(row["Estoque"] || row["estoque"] || row["ESTOQUE"] || "0")
        );
        const price = parseFloat(
          String(row["Preço"] || row["preco"] || row["PRECO"] || "0").replace(
            ",",
            "."
          )
        );

        return {
          code: String(code),
          name: String(description),
          category: "Diversos", // categoria padrão, pode ser melhorado
          unit,
          stock,
          priceCents: Math.round(price * 100), // converter para centavos
          slug: String(code)
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, ""),
        };
      })
      .filter((product) => product.name && product.priceCents > 0);

    // Inserir produtos em lote
    const results = [];
    for (const product of products) {
      try {
        const created = await prisma.product.upsert({
          where: { slug: product.slug },
          update: {
            name: product.name,
            priceCents: product.priceCents,
          },
          create: {
            slug: product.slug,
            name: product.name,
            category: product.category,
            priceCents: product.priceCents,
          },
        });
        results.push({ success: true, product: created });
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : "Erro desconhecido",
          product: product,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const errorCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      message: `Importação concluída: ${successCount} produtos importados, ${errorCount} erros`,
      total: products.length,
      success: successCount,
      errors: errorCount,
      results: results.slice(0, 10), // retornar apenas os primeiros 10 para não sobrecarregar
    });
  } catch (error: unknown) {
    console.error("Erro na importação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
