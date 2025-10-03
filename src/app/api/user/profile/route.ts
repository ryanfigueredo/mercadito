import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Função para validar CPF real
function isValidCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) return false;
  
  return true;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        document: true,
        isAdmin: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Erro ao buscar perfil do usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone, email, document } = await req.json();

    // Se apenas CPF está sendo atualizado
    if (document && !name && !phone && !email) {
      // Validar formato do CPF
      const cleanDocument = document.replace(/\D/g, "");
      if (cleanDocument.length !== 11) {
        return NextResponse.json(
          { error: "CPF deve ter 11 dígitos" },
          { status: 400 }
        );
      }

      // Validar CPF real (algoritmo de validação)
      if (!isValidCPF(cleanDocument)) {
        return NextResponse.json(
          { error: "CPF inválido. Verifique os números digitados." },
          { status: 400 }
        );
      }

      // Verificar se CPF já existe para outro usuário
      const existingUser = await prisma.user.findFirst({
        where: {
          document: cleanDocument,
          email: { not: session.user.email }
        }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Este CPF já está cadastrado para outra conta." },
          { status: 400 }
        );
      }

      const user = await prisma.user.update({
        where: { email: session.user.email },
        data: {
          document: cleanDocument,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          document: true,
          isAdmin: true,
        },
      });

      return NextResponse.json(user);
    }

    // Validar dados obrigatórios para atualização completa
    if (!name || !phone || !email || !document) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar formato do CPF
    const cleanDocument = document.replace(/\D/g, "");
    if (cleanDocument.length !== 11) {
      return NextResponse.json(
        { error: "CPF deve ter 11 dígitos" },
        { status: 400 }
      );
    }

    // Validar CPF real (algoritmo de validação)
    if (!isValidCPF(cleanDocument)) {
      return NextResponse.json(
        { error: "CPF inválido. Verifique os números digitados." },
        { status: 400 }
      );
    }

    // Verificar se CPF já existe para outro usuário
    const existingUser = await prisma.user.findFirst({
      where: {
        document: cleanDocument,
        email: { not: session.user.email }
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este CPF já está cadastrado para outra conta." },
        { status: 400 }
      );
    }

    // Validar formato do telefone
    const cleanPhone = phone.replace(/\D/g, "");

    // Se não começar com 55, adiciona automaticamente
    let finalPhone = cleanPhone;
    if (!finalPhone.startsWith("55")) {
      finalPhone = "55" + finalPhone;
    }

    // Valida se tem pelo menos 13 dígitos (55 + 11 dígitos do celular)
    if (finalPhone.length < 13) {
      return NextResponse.json(
        { error: "Telefone deve ter 11 dígitos (ex: 11999999999)" },
        { status: 400 }
      );
    }

    // Limita a 13 dígitos
    finalPhone = finalPhone.substring(0, 13);

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        phone: finalPhone,
        email,
        document: cleanDocument,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        document: true,
        isAdmin: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Erro ao atualizar perfil do usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
