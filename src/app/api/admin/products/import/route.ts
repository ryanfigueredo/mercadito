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

    // Função para mapear categoria baseada na descrição
    const inferCategory = (description: string): string => {
      const desc = description.toLowerCase();

      if (
        desc.includes("arroz") ||
        desc.includes("feijão") ||
        desc.includes("feijao") ||
        desc.includes("macarrão") ||
        desc.includes("macarrao") ||
        desc.includes("farinha") ||
        desc.includes("açúcar") ||
        desc.includes("acucar") ||
        desc.includes("sal")
      ) {
        return "Grãos";
      }

      if (
        desc.includes("refrigerante") ||
        desc.includes("suco") ||
        desc.includes("água") ||
        desc.includes("agua") ||
        desc.includes("cerveja") ||
        desc.includes("bebida")
      ) {
        return "Bebidas";
      }

      if (
        desc.includes("pão") ||
        desc.includes("pao") ||
        desc.includes("bolo") ||
        desc.includes("biscoito") ||
        desc.includes("torrada")
      ) {
        return "Padaria";
      }

      if (
        desc.includes("detergente") ||
        desc.includes("sabão") ||
        desc.includes("sabao") ||
        desc.includes("amaciante") ||
        desc.includes("desinfetante") ||
        desc.includes("álcool")
      ) {
        return "Limpeza";
      }

      if (
        desc.includes("tomate") ||
        desc.includes("cebola") ||
        desc.includes("batata") ||
        desc.includes("alface") ||
        desc.includes("fruta") ||
        desc.includes("verdura")
      ) {
        return "Hortifruti";
      }

      return "Diversos"; // Categoria padrão
    };

    // Mapear colunas do Excel para campos do produto
    // Esperado: Código | Descrição | Und (ignorar) | Estoque | Preço
    const processedData = jsonData.map(
      (row: Record<string, unknown>, index: number) => {
        try {
          // Pegar valores das colunas (tentando diferentes variações de nome)
          const code = String(
            row["Código"] ||
              row["Codigo"] ||
              row["CODIGO"] ||
              row["codigo"] ||
              Object.values(row)[0] ||
              `PROD${String(index + 1).padStart(3, "0")}`
          ).trim();

          const description = String(
            row["Descrição"] ||
              row["Descricao"] ||
              row["DESCRICAO"] ||
              row["descricao"] ||
              Object.values(row)[1] ||
              ""
          ).trim();

          // Ignorar coluna Und (índice 2)

          const stock = Number(
            String(
              row["Estoque"] ||
                row["ESTOQUE"] ||
                row["estoque"] ||
                Object.values(row)[3] ||
                0
            )
              .replace(/[^\d.,]/g, "")
              .replace(",", ".")
          );

          const price = Number(
            String(
              row["Preço"] ||
                row["Preco"] ||
                row["PRECO"] ||
                row["preco"] ||
                row["Valor"] ||
                row["VALOR"] ||
                row["valor"] ||
                Object.values(row)[4] ||
                0
            )
              .replace(/[^\d.,]/g, "")
              .replace(",", ".")
          );

          // Validações
          if (!description || description.length < 2) {
            return {
              error: `Linha ${index + 2}: Descrição inválida ou vazia`,
              row: index + 2,
              data: { code, description, stock, price },
            };
          }

          if (price <= 0) {
            return {
              error: `Linha ${
                index + 2
              }: Preço deve ser maior que zero (${price})`,
              row: index + 2,
              data: { code, description, stock, price },
            };
          }

          if (stock < 0) {
            return {
              error: `Linha ${
                index + 2
              }: Estoque não pode ser negativo (${stock})`,
              row: index + 2,
              data: { code, description, stock, price },
            };
          }

          // Gerar slug a partir do código
          const slug = code
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remove acentos
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

          return {
            slug,
            name: description,
            category: inferCategory(description),
            priceCents: Math.round(price * 100),
            stock: Math.max(0, Math.floor(stock)),
            code, // Manter código original para relatório
            originalRow: index + 2,
          };
        } catch (error) {
          return {
            error: `Linha ${index + 2}: Erro ao processar dados - ${
              error instanceof Error ? error.message : "Erro desconhecido"
            }`,
            row: index + 2,
          };
        }
      }
    );

    // Separar produtos válidos de erros
    const validProducts = processedData.filter(
      (p) => !("error" in p)
    ) as Array<{
      slug: string;
      name: string;
      category: string;
      priceCents: number;
      stock: number;
      code: string;
      originalRow: number;
    }>;

    const processingErrors = processedData.filter(
      (p) => "error" in p
    ) as Array<{ error: string; row: number }>;

    if (validProducts.length === 0) {
      return NextResponse.json(
        {
          error: "Nenhum produto válido encontrado",
          details: processingErrors.map((e) => e.error),
          total: jsonData.length,
          processed: 0,
          errors: processingErrors.length,
        },
        { status: 400 }
      );
    }

    // Verificar duplicatas por slug
    const duplicates = [];
    const uniqueProducts = [];
    const slugMap = new Map();

    for (const product of validProducts) {
      if (slugMap.has(product.slug)) {
        duplicates.push({
          code: product.code,
          name: product.name,
          row: product.originalRow,
          duplicateOf: slugMap.get(product.slug),
        });
      } else {
        slugMap.set(product.slug, {
          code: product.code,
          name: product.name,
          row: product.originalRow,
        });
        uniqueProducts.push(product);
      }
    }

    // Inserir produtos únicos no banco
    const results = [];
    const updated = [];
    const created = [];

    for (const product of uniqueProducts) {
      try {
        // Verificar se já existe
        const existing = await prisma.product.findUnique({
          where: { slug: product.slug },
        });

        if (existing) {
          // Atualizar produto existente
          const updatedProduct = await prisma.product.update({
            where: { slug: product.slug },
            data: {
              name: product.name,
              category: product.category,
              priceCents: product.priceCents,
              stock: product.stock,
            },
          });
          updated.push({
            code: product.code,
            name: product.name,
            row: product.originalRow,
            action: "updated",
          });
          results.push({
            success: true,
            product: updatedProduct,
            action: "updated",
          });
        } else {
          // Criar novo produto
          const newProduct = await prisma.product.create({
            data: {
              slug: product.slug,
              name: product.name,
              category: product.category,
              priceCents: product.priceCents,
              stock: product.stock,
            },
          });
          created.push({
            code: product.code,
            name: product.name,
            row: product.originalRow,
            action: "created",
          });
          results.push({
            success: true,
            product: newProduct,
            action: "created",
          });
        }
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : "Erro desconhecido",
          product: product,
          code: product.code,
          row: product.originalRow,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const errorCount = results.filter((r) => !r.success).length;
    const dbErrors = results.filter((r) => !r.success);

    // Relatório completo
    const report = {
      summary: {
        totalRows: jsonData.length,
        validProducts: validProducts.length,
        processed: successCount,
        created: created.length,
        updated: updated.length,
        duplicatesInFile: duplicates.length,
        processingErrors: processingErrors.length,
        databaseErrors: errorCount,
      },
      details: {
        created: created.slice(0, 10),
        updated: updated.slice(0, 10),
        duplicatesInFile: duplicates,
        processingErrors: processingErrors.slice(0, 10),
        databaseErrors: dbErrors.slice(0, 10),
      },
    };

    return NextResponse.json({
      message: `Importação concluída: ${created.length} criados, ${updated.length} atualizados, ${duplicates.length} duplicatas no arquivo, ${processingErrors.length} erros de processamento, ${errorCount} erros de banco`,
      ...report,
    });
  } catch (error: unknown) {
    console.error("Erro na importação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
