import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar senha
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Buscar usuário pelo token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gte: new Date(), // Token ainda não expirou
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 400 }
      );
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Atualizar senha e limpar token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    console.log(`Senha redefinida com sucesso para: ${user.email}`);

    return NextResponse.json({
      message: "Senha redefinida com sucesso! Você já pode fazer login.",
    });
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
