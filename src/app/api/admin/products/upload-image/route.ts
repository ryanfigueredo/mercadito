import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToS3, generateProductImageKey } from "@/lib/aws-s3";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const productId = formData.get("productId") as string;

    if (!file || !productId) {
      return NextResponse.json(
        { error: "Arquivo e ID do produto são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Apenas imagens são permitidas" },
        { status: 400 }
      );
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Arquivo muito grande (máximo 5MB)" },
        { status: 400 }
      );
    }

    // Verificar se o produto existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    // Converter arquivo para buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Gerar chave única para o S3
    const key = generateProductImageKey(productId, file.name);

    // Fazer upload para S3
    const imageUrl = await uploadToS3(buffer, key, file.type);

    // Atualizar produto com nova URL da imagem
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { imageUrl },
    });

    return NextResponse.json({
      success: true,
      imageUrl,
      product: updatedProduct,
    });
  } catch (error: unknown) {
    console.error("Erro no upload da imagem:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}
