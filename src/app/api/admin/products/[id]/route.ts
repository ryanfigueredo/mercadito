import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import {
  updateProductSchema,
  validateDTO,
  createErrorResponse,
} from "@/lib/dto-validators";
import type { UpdateProductDTO, ProductResponseDTO } from "@/types/dto";

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

    const validation = validateDTO(updateProductSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse(
          "Dados inválidos",
          validation.errors,
          "VALIDATION_ERROR"
        ),
        { status: 400 }
      );
    }

    const updateData: UpdateProductDTO = validation.data;

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
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se produto tem pedidos associados
    if (existingProduct.items.length > 0) {
      return NextResponse.json(
        {
          error: "Não é possível excluir produto que possui pedidos associados",
        },
        { status: 400 }
      );
    }

    // Deletar produto
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Produto excluído com sucesso" });
  } catch (error: unknown) {
    console.error("Erro ao excluir produto:", error);

    if (error instanceof Error && error.message.includes("access_denied")) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
