import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST() {
  // Apenas em desenvolvimento
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Esta operação não é permitida em produção" },
      { status: 403 }
    );
  }

  try {
    console.log("🧹 Limpando banco de dados...");

    // Função auxiliar para deletar com tratamento de erro
    const safeDelete = async (model: any, name: string) => {
      try {
        await model.deleteMany();
        console.log(`  ✅ ${name} removido`);
      } catch (error: any) {
        if (error.code === "P2021") {
          // Tabela não existe
          console.log(`  ⚠️  ${name} não existe (pulando)`);
        } else {
          throw error;
        }
      }
    };

    // Deletar em ordem (respeitando foreign keys)
    await safeDelete(prisma.notification, "Notificações");
    await safeDelete(prisma.orderItem, "Itens de pedidos");
    await safeDelete(prisma.order, "Pedidos");
    await safeDelete(prisma.savedCard, "Cartões salvos");
    await safeDelete(prisma.address, "Endereços");
    await safeDelete(prisma.product, "Produtos");
    await safeDelete(prisma.shippingConfig, "Configurações de frete");
    await safeDelete(prisma.user, "Usuários");

          console.log("  ✅ Criando usuário admin...");

      // Verificar se a tabela User existe
      try {
        // Tentar fazer uma query simples para verificar se a tabela existe
        await prisma.$queryRaw`SELECT 1 FROM "User" LIMIT 1`;
        
        // Criar admin joaber@seumercadito.com.br
        const adminPassword = await bcrypt.hash("joaber123", 10);
        
        // Tentar encontrar usuário existente
        const existingAdmin = await prisma.user.findUnique({
          where: { email: "joaber@seumercadito.com.br" },
        });
        
        let admin;
        if (existingAdmin) {
          // Atualizar se já existe
          admin = await prisma.user.update({
            where: { email: "joaber@seumercadito.com.br" },
            data: {
              name: "Joaber Admin",
              password: adminPassword,
              isAdmin: true,
            },
          });
          console.log(`  ✅ Admin atualizado: ${admin.email}`);
        } else {
          // Criar novo
          admin = await prisma.user.create({
            data: {
              email: "joaber@seumercadito.com.br",
              name: "Joaber Admin",
              password: adminPassword,
              isAdmin: true,
            },
          });
          console.log(`  ✅ Admin criado: ${admin.email}`);
        }
      } catch (error: any) {
        if (error.code === "P2021" || error.message?.includes("does not exist")) {
          return NextResponse.json(
            {
              error: "Tabelas não existem",
              message: "Execute as migrations primeiro: npx prisma migrate deploy",
            },
            { status: 400 }
          );
        } else {
          throw error;
        }
      }

    return NextResponse.json({
      success: true,
      message: "Banco de dados resetado com sucesso",
      admin: {
        email: admin.email,
        name: admin.name,
        password: "joaber123", // Apenas para dev
      },
    });
  } catch (error: unknown) {
    console.error("❌ Erro ao resetar banco:", error);
    return NextResponse.json(
      {
        error: "Erro ao resetar banco de dados",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
