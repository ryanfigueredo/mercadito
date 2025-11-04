import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const verifyCodeSchema = z.object({
  email: z.string().email("E-mail inválido"),
  code: z.string().length(6, "Código deve ter 6 dígitos"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = verifyCodeSchema.parse(body);
    const normalizedEmail = email.toLowerCase().trim();

    // Buscar código de verificação
    const verification = await prisma.emailVerification.findUnique({
      where: { email: normalizedEmail },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "Código de verificação não encontrado. Solicite um novo código." },
        { status: 404 }
      );
    }

    // Verificar se expirou
    if (new Date() > verification.expiresAt) {
      await prisma.emailVerification.delete({
        where: { email: normalizedEmail },
      });
      return NextResponse.json(
        { error: "Código expirado. Solicite um novo código." },
        { status: 400 }
      );
    }

    // Verificar tentativas (máximo 5)
    if (verification.attempts >= 5) {
      await prisma.emailVerification.delete({
        where: { email: normalizedEmail },
      });
      return NextResponse.json(
        { error: "Muitas tentativas incorretas. Solicite um novo código." },
        { status: 400 }
      );
    }

    // Verificar código
    if (verification.code !== code) {
      // Incrementar tentativas
      await prisma.emailVerification.update({
        where: { email: normalizedEmail },
        data: {
          attempts: verification.attempts + 1,
        },
      });

      const remainingAttempts = 5 - (verification.attempts + 1);
      return NextResponse.json(
        {
          error: `Código incorreto. Você tem mais ${remainingAttempts} tentativa(s).`,
        },
        { status: 400 }
      );
    }

    // Código válido! Marcar como verificado
    await prisma.emailVerification.update({
      where: { email: normalizedEmail },
      data: {
        verified: true,
        verifiedAt: new Date(),
        // Manter o registro por mais 1 hora para permitir o cadastro
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Email verificado com sucesso",
    });
  } catch (error: unknown) {
    console.error("Erro ao verificar código:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Dados inválidos" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
