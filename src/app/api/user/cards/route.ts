import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Listar cartões salvos do usuário
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { cards: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ cards: user.cards });
  } catch (error) {
    console.error("Erro ao buscar cartões:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Adicionar novo cartão
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { lastFour, brand, holderName, expMonth, expYear, isDefault } = body;

    // Se este for o cartão padrão, remover padrão dos outros
    if (isDefault) {
      await prisma.savedCard.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const card = await prisma.savedCard.create({
      data: {
        lastFour,
        brand,
        holderName,
        expMonth,
        expYear,
        isDefault: isDefault || false,
        userId: user.id,
      },
    });

    return NextResponse.json({ card });
  } catch (error) {
    console.error("Erro ao criar cartão:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Remover cartão
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("cardId");

    if (!cardId) {
      return NextResponse.json(
        { error: "ID do cartão é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o cartão pertence ao usuário
    const card = await prisma.savedCard.findFirst({
      where: { id: cardId, userId: user.id },
    });

    if (!card) {
      return NextResponse.json(
        { error: "Cartão não encontrado" },
        { status: 404 }
      );
    }

    await prisma.savedCard.delete({
      where: { id: cardId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar cartão:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
