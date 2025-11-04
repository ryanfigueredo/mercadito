import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";
import { isValidCPF, stripCpfNonDigits } from "@/lib/cpf";

const registerSchema = z
  .object({
    firstName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    lastName: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
    email: z.string().email("E-mail inválido"),
    cpf: z
      .string()
      .transform((v) => stripCpfNonDigits(v))
      .refine((v) => v.length === 11, { message: "CPF deve ter 11 dígitos" })
      .refine((v) => isValidCPF(v), { message: "CPF inválido" }),
    phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirm: z.string().min(6, "Confirme a senha"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
  });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validar dados
    const validatedData = registerSchema.parse(body);
    const normalizedEmail = validatedData.email.toLowerCase().trim();

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este e-mail já está em uso" },
        { status: 400 }
      );
    }

    // Verificar se o email foi verificado
    const emailVerification = await prisma.emailVerification.findUnique({
      where: { email: normalizedEmail },
    });

    if (!emailVerification || !emailVerification.verified) {
      return NextResponse.json(
        { error: "Por favor, verifique seu email antes de criar a conta" },
        { status: 400 }
      );
    }

    // Verificar se a verificação ainda é válida (não expirou)
    if (new Date() > emailVerification.expiresAt) {
      await prisma.emailVerification.delete({
        where: { email: normalizedEmail },
      });
      return NextResponse.json(
        {
          error:
            "Verificação de email expirada. Por favor, solicite um novo código.",
        },
        { status: 400 }
      );
    }

    // Verificar se CPF já existe
    const existingCPF = await prisma.user.findFirst({
      where: { document: validatedData.cpf },
    });

    if (existingCPF) {
      return NextResponse.json(
        { error: "Este CPF já está cadastrado" },
        { status: 400 }
      );
    }

    // Criptografar senha
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name: `${validatedData.firstName} ${validatedData.lastName}`,
        email: normalizedEmail,
        document: validatedData.cpf,
        phone: validatedData.phone,
        password: hashedPassword,
        emailVerified: true, // Email já foi verificado
      },
    });

    // Deletar registro de verificação após criar o usuário
    await prisma.emailVerification
      .delete({
        where: { email: normalizedEmail },
      })
      .catch(() => {
        // Ignorar erro se já foi deletado
      });

    return NextResponse.json({
      success: true,
      message: "Usuário criado com sucesso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: unknown) {
    console.error("Erro no registro:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
