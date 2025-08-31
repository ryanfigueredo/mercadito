import Topbar from "@/components/Topbar";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ConfiguracoesPage() {
  const user = await prisma.user.findUnique({
    where: { email: "dev@mercadito.local" },
    include: { addresses: true },
  });

  const primaryAddress = user?.addresses[0];
  const addressLine = primaryAddress
    ? `${primaryAddress.street}, ${primaryAddress.city}`
    : undefined;

  return (
    <div className="min-h-dvh">
      <Topbar isLogged={!!user} address={addressLine} />
      <main className="mx-auto max-w-sm px-4 py-6">
        <div className="flex items-center justify-between mb-3">
          <h1 className="h-title">Configurações</h1>
          <Link href="/perfil" className="text-sm text-brand-600 font-semibold">
            Voltar
          </Link>
        </div>

        <section className="card p-4 space-y-3">
          <Toggle checked>Ativar Notificações PUSH</Toggle>
          <Toggle checked>Ativar Notificações via SMS</Toggle>
          <Toggle checked>Ativar Notificações via Email</Toggle>

          <div className="mt-2 rounded-xl border p-3">
            <h2 className="font-semibold">Comunicação de Promoções</h2>
            <div className="mt-2 space-y-2">
              <Toggle>Notificações</Toggle>
              <Toggle defaultChecked>E-mail</Toggle>
              <Toggle>SMS</Toggle>
              <Toggle>WhatsApp</Toggle>
            </div>
            <button className="btn mt-3 w-full">Salvar alterações</button>
          </div>
        </section>
      </main>
    </div>
  );
}

function Toggle({
  children,
  checked,
  defaultChecked,
}: {
  children: React.ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <input
        type="checkbox"
        className="h-4 w-4"
        defaultChecked={defaultChecked}
        checked={checked}
        readOnly={checked !== undefined}
      />
      {children}
    </label>
  );
}
