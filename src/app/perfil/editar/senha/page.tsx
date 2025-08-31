import Topbar from "@/components/Topbar";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AlterarSenhaPage() {
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
          <h1 className="h-title">Alterar Senha</h1>
          <Link
            href="/perfil/editar"
            className="text-sm text-brand-600 font-semibold"
          >
            Voltar
          </Link>
        </div>

        <section className="card p-4 space-y-3">
          <Field label="Senha Atual">
            <input
              className="input"
              type="password"
              placeholder="Insira sua senha atual"
            />
          </Field>
          <Field label="Nova Senha">
            <input
              className="input"
              type="password"
              placeholder="Insira sua nova senha"
            />
          </Field>
          <Field label="Nova Senha">
            <input
              className="input"
              type="password"
              placeholder="Insira sua nova senha novamente"
            />
          </Field>
          <div className="pt-2">
            <button className="btn w-full">Salvar alterações</button>
          </div>
        </section>
      </main>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm text-muted">{label}</label>
      {children}
    </div>
  );
}
