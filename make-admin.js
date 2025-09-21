const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function makeAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.log("❌ Uso: node make-admin.js email@exemplo.com");
    process.exit(1);
  }

  try {
    console.log(`🔍 Buscando usuário: ${email}`);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, isAdmin: true },
    });

    if (!user) {
      console.log(`❌ Usuário com email "${email}" não encontrado.`);
      console.log("💡 Certifique-se de que o usuário já se cadastrou no app.");
      process.exit(1);
    }

    if (user.isAdmin) {
      console.log(`✅ Usuário "${user.name}" já é admin!`);
      process.exit(0);
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { isAdmin: true },
      select: { name: true, email: true, isAdmin: true },
    });

    console.log("🎉 Usuário promovido a admin com sucesso!");
    console.log(`   Nome: ${updatedUser.name}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Admin: ${updatedUser.isAdmin}`);
    console.log("");
    console.log("🚀 Agora este usuário pode acessar /admin");
  } catch (error) {
    console.log("❌ Erro:", error.message);
    process.exit(1);
  }
}

makeAdmin()
  .catch((e) => {
    console.error("💥 Erro inesperado:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
