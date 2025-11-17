import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import { createErrorResponse } from "@/lib/dto-validators";
import { handleDatabaseError, withRetry } from "@/lib/db-error-handler";
import type { ProductResponseDTO } from "@/types/dto";

// Normaliza para "Title Case" (pt-BR): cada palavra com a primeira letra maiúscula
// Mantém preposições e unidades de medida em minúsculas
function toTitleCase(input: string) {
  // Preposições e artigos que devem ficar em minúsculas
  const lowercaseWords = [
    "de", "da", "do", "das", "dos", "e", "em", "no", "na", "nas", "nos",
    "com", "por", "para", "a", "ao", "aos", "às", "ou", "que", "se", "um", "uma", "uns", "umas"
  ];
  
  // Unidades de medida que devem ficar em minúsculas
  const units = ["kg", "g", "mg", "ml", "l", "lt", "lts", "cm", "m", "mm", "un", "unidades", "cx", "caixa", "pct", "pacote"];
  
  return input
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word, index) => {
      const lower = word.toLocaleLowerCase("pt-BR");
      const lowerClean = lower.replace(/[.,;!?]/g, ""); // Remove pontuação para verificação
      
      // Verifica se é número seguido de unidade (ex: "500ML", "5KG")
      const numberUnitMatch = lower.match(/^(\d+)([a-z]+)$/);
      if (numberUnitMatch) {
        const [, number, unitPart] = numberUnitMatch;
        // Verifica se a parte após o número é uma unidade conhecida
        const unitMatch = units.find(u => unitPart === u || unitPart.startsWith(u));
        if (unitMatch && unitPart.length <= 4) { // Limita tamanho para evitar falsos positivos
          return number + unitMatch;
        }
      }
      
      // Primeira palavra sempre capitaliza (exceto se for número)
      if (index === 0 && !/^\d/.test(word)) {
        return lower.charAt(0).toLocaleUpperCase("pt-BR") + lower.slice(1);
      }
      
      // Verifica se é apenas número (mantém como está)
      if (/^\d+$/.test(word)) {
        return word;
      }
      
      // Verifica se é unidade de medida isolada (mantém minúscula)
      if (units.includes(lowerClean)) {
        return lower;
      }
      
      // Verifica se é preposição (mantém minúscula, exceto se for a primeira palavra)
      if (lowercaseWords.includes(lowerClean) && index > 0) {
        return lower;
      }
      
      // Demais palavras: primeira letra maiúscula
      return lower.charAt(0).toLocaleUpperCase("pt-BR") + lower.slice(1);
    })
    .join(" ");
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar se é admin
    await requireAdmin();

    const { id } = await params;
    const body = await req.json();

    // Validar DTO - só validar se há dados para validar
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        createErrorResponse(
          "Nenhum dado fornecido para atualização",
          undefined,
          "NO_DATA"
        ),
        { status: 400 }
      );
    }

    // Validação manual simples para evitar problemas com Zod
    const updateData: any = {};

    // Validar campos individualmente
    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim().length < 2) {
        return NextResponse.json(
          createErrorResponse(
            "Nome deve ter pelo menos 2 caracteres",
            undefined,
            "VALIDATION_ERROR"
          ),
          { status: 400 }
        );
      }
      updateData.name = toTitleCase(body.name.trim());
    }

    if (body.category !== undefined) {
      const validCategories = [
        "Grãos",
        "Bebidas",
        "Padaria",
        "Limpeza",
        "Hortifruti",
        "Diversos",
      ];
      if (!validCategories.includes(body.category)) {
        return NextResponse.json(
          createErrorResponse(
            "Categoria inválida",
            undefined,
            "VALIDATION_ERROR"
          ),
          { status: 400 }
        );
      }
      updateData.category = body.category;
    }

    if (body.priceCents !== undefined) {
      const price = Number(body.priceCents);
      if (isNaN(price) || price <= 0) {
        return NextResponse.json(
          createErrorResponse(
            "Preço deve ser maior que zero",
            undefined,
            "VALIDATION_ERROR"
          ),
          { status: 400 }
        );
      }
      updateData.priceCents = Math.round(price);
    }

    if (body.stock !== undefined) {
      const stock = Number(body.stock);
      if (isNaN(stock) || stock < 0) {
        return NextResponse.json(
          createErrorResponse(
            "Estoque não pode ser negativo",
            undefined,
            "VALIDATION_ERROR"
          ),
          { status: 400 }
        );
      }
      updateData.stock = Math.floor(stock);
    }

    if (body.imageUrl !== undefined) {
      if (
        typeof body.imageUrl !== "string" ||
        body.imageUrl.trim().length === 0
      ) {
        return NextResponse.json(
          createErrorResponse(
            "URL da imagem inválida",
            undefined,
            "VALIDATION_ERROR"
          ),
          { status: 400 }
        );
      }
      updateData.imageUrl = body.imageUrl.trim();
    }

    if (body.promoText !== undefined) {
      if (body.promoText === null) {
        updateData.promoText = null;
      } else if (typeof body.promoText === "string") {
        updateData.promoText = body.promoText.trim() || null;
      }
    }

    // Verificar se produto existe e atualizar com retry
    const result = await withRetry(async () => {
      const existingProduct = await prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      // Atualizar produto
      return await prisma.product.update({
        where: { id },
        data: updateData,
      });
    });

    if (!result) {
      return NextResponse.json(
        createErrorResponse(
          "Produto não encontrado",
          undefined,
          "PRODUCT_NOT_FOUND"
        ),
        { status: 404 }
      );
    }

    const updatedProduct = result;

    // Retornar DTO de resposta
    const responseDTO: ProductResponseDTO = {
      id: updatedProduct.id,
      slug: updatedProduct.slug,
      name: updatedProduct.name,
      category: updatedProduct.category,
      priceCents: updatedProduct.priceCents,
      stock: updatedProduct.stock,
      imageUrl: updatedProduct.imageUrl || undefined,
      promoText: updatedProduct.promoText || undefined,
      createdAt: updatedProduct.createdAt.toISOString(),
      updatedAt: updatedProduct.updatedAt.toISOString(),
    };

    return NextResponse.json(responseDTO);
  } catch (error: unknown) {
    console.error("Erro ao atualizar produto:", error);

    if (error instanceof Error && error.message.includes("access_denied")) {
      return NextResponse.json(
        createErrorResponse("Acesso negado", undefined, "ACCESS_DENIED"),
        { status: 403 }
      );
    }

    return NextResponse.json(
      createErrorResponse(
        "Erro interno do servidor",
        undefined,
        "INTERNAL_ERROR"
      ),
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar se é admin
    await requireAdmin();

    const { id } = await params;

    // Verificar se produto existe e deletar com retry
    const result = await withRetry(async () => {
      const existingProduct = await prisma.product.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!existingProduct) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      // Verificar se produto tem pedidos associados
      if (existingProduct.items.length > 0) {
        const error = new Error("PRODUCT_HAS_ORDERS");
        (error as any).itemsCount = existingProduct.items.length;
        throw error;
      }

      // Deletar imagem do S3 se existir
      if (existingProduct.imageUrl) {
        try {
          const { deleteFromS3 } = await import("@/lib/aws-s3");
          const { extractS3Path } = await import("@/lib/image-utils");
          const s3Path = extractS3Path(existingProduct.imageUrl);
          if (s3Path) {
            await deleteFromS3(s3Path);
          }
        } catch (s3Error) {
          console.warn("Erro ao deletar imagem do S3:", s3Error);
          // Continua mesmo se falhar ao deletar imagem
        }
      }

      // Deletar produto
      await prisma.product.delete({
        where: { id },
      });

      return existingProduct;
    });

    if (!result) {
      return NextResponse.json(
        createErrorResponse(
          "Erro ao processar exclusão",
          undefined,
          "DELETE_ERROR"
        ),
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Produto excluído com sucesso",
      deletedProduct: {
        id: result.id,
        name: result.name,
        slug: result.slug,
      },
    });
  } catch (error: unknown) {
    console.error("Erro ao excluir produto:", error);

    // Tratar erros específicos
    if (error instanceof Error) {
      if (error.message === "PRODUCT_NOT_FOUND") {
        return NextResponse.json(
          createErrorResponse(
            "Produto não encontrado",
            undefined,
            "PRODUCT_NOT_FOUND"
          ),
          { status: 404 }
        );
      }

      if (error.message === "PRODUCT_HAS_ORDERS") {
        const itemsCount = (error as any).itemsCount || 0;
        return NextResponse.json(
          createErrorResponse(
            "Não é possível excluir produto que possui pedidos associados",
            [`Produto tem ${itemsCount} item(s) em pedidos`],
            "PRODUCT_HAS_ORDERS"
          ),
          { status: 400 }
        );
      }

      if (error.message.includes("access_denied")) {
        return NextResponse.json(
          createErrorResponse("Acesso negado", undefined, "ACCESS_DENIED"),
          { status: 403 }
        );
      }
    }

    // Tratar erros de banco de dados
    const dbError = handleDatabaseError(error);

    if (dbError.code === "CONNECTION_ERROR") {
      return NextResponse.json(
        createErrorResponse(dbError.message, undefined, dbError.code),
        { status: 503 } // Service Unavailable
      );
    }

    return NextResponse.json(
      createErrorResponse(dbError.message, undefined, dbError.code),
      { status: 500 }
    );
  }
}
