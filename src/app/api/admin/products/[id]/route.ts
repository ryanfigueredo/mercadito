import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se é admin
    await requireAdmin();

    const { id } = params;
    const body = await req.json();

    // Validar campos permitidos
    const allowedFields = [
      "name",
      "category",
      "priceCents",
      "stock",
      "imageUrl",
      "promoText",
    ];
    const updateData: Record<string, any> = {};

    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        updateData[key] = value;
      }
    }

    // Validações específicas
    if (updateData.stock !== undefined) {
      const stock = Number(updateData.stock);
      if (isNaN(stock) || stock < 0) {
        return NextResponse.json(
          { error: "Estoque deve ser um número não negativo" },
          { status: 400 }
        );
      }
      updateData.stock = Math.floor(stock);
    }

    if (updateData.priceCents !== undefined) {
      const price = Number(updateData.priceCents);
      if (isNaN(price) || price <= 0) {
        return NextResponse.json(
          { error: "Preço deve ser um número positivo" },
          { status: 400 }
        );
      }
      updateData.priceCents = Math.round(price);
    }

    // Verificar se produto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar produto
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedProduct);
  } catch (error: unknown) {
    console.error("Erro ao atualizar produto:", error);

    if (error instanceof Error && error.message.includes("access_denied")) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se é admin
    await requireAdmin();

    const { id } = params;

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
