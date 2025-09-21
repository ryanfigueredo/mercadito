import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import { createErrorResponse } from "@/lib/dto-validators";
import type { ProductResponseDTO } from "@/types/dto";

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
      updateData.name = body.name.trim();
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

    // Verificar se produto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        createErrorResponse(
          "Produto não encontrado",
          undefined,
          "PRODUCT_NOT_FOUND"
        ),
        { status: 404 }
      );
    }

    // Atualizar produto
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });

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

    // Verificar se produto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingProduct) {
      return NextResponse.json(
        createErrorResponse(
          "Produto não encontrado",
          undefined,
          "PRODUCT_NOT_FOUND"
        ),
        { status: 404 }
      );
    }

    // Verificar se produto tem pedidos associados
    if (existingProduct.items.length > 0) {
      return NextResponse.json(
        createErrorResponse(
          "Não é possível excluir produto que possui pedidos associados",
          [`Produto tem ${existingProduct.items.length} item(s) em pedidos`],
          "PRODUCT_HAS_ORDERS"
        ),
        { status: 400 }
      );
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
      } catch (error) {
        console.warn("Erro ao deletar imagem do S3:", error);
        // Continua mesmo se falhar ao deletar imagem
      }
    }

    // Deletar produto
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Produto excluído com sucesso",
      deletedProduct: {
        id: existingProduct.id,
        name: existingProduct.name,
        slug: existingProduct.slug,
      },
    });
  } catch (error: unknown) {
    console.error("Erro ao excluir produto:", error);

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
