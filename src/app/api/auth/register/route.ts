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

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este e-mail já está em uso" },
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
        email: validatedData.email,
        document: validatedData.cpf,
        phone: validatedData.phone,
        password: hashedPassword,
      },
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
