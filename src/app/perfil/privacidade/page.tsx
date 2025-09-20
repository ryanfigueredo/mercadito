import Topbar from "@/components/Topbar";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PrivacidadePage() {
  const session = await getServerSession(authOptions);
  const user = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { addresses: true },
      })
    : null;

  if (!user) {
    redirect("/auth/login");
  }

  const primaryAddress = user?.addresses[0];
  const addressLine = primaryAddress
    ? `${primaryAddress.street}, ${primaryAddress.city}`
    : undefined;

  return (
    <div className="min-h-dvh">
      <Topbar isLogged={!!user} address={addressLine} />
      <main className="mx-auto max-w-sm px-4 py-6">
        <div className="flex items-center justify-between mb-3">
          <h1 className="h-title">Privacidade</h1>
          <Link href="/perfil" className="text-sm text-black font-semibold">
            Voltar
          </Link>
        </div>

        <section className="card p-4 space-y-3">
          <Toggle>Permitir acesso a Localização</Toggle>
          <Toggle>Permitir compartilhamento de dados</Toggle>
          <Toggle>Permitir acesso a outros apps</Toggle>

          <button className="btn mt-2 w-full">Salvar alterações</button>
        </section>
      </main>
    </div>
  );
}

function Toggle({ children }: { children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <input type="checkbox" className="h-4 w-4" />
      {children}
    </label>
  );
}
