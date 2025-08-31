import Topbar from "@/components/Topbar";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function EditarPerfilPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { addresses: true },
      })
    : null;

  if (!user) {
    return (
      <div className="min-h-dvh">
        <Topbar isLogged={false} />
        <main className="mx-auto max-w-sm px-4 py-6">
          <p className="text-sm">Faça login para editar seu perfil.</p>
          <Link
            href="/auth/login"
            className="mt-2 inline-block font-semibold text-brand-600"
          >
            Login
          </Link>
        </main>
      </div>
    );
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
          <h1 className="h-title">Editar Perfil</h1>
          <Link href="/perfil" className="text-sm text-brand-600 font-semibold">
            Voltar
          </Link>
        </div>

        <section className="card p-4 space-y-3">
          <Field label="Nome">
            <input className="input" defaultValue={user?.name ?? ""} />
          </Field>
          <Field label="Telefone">
            <input className="input" placeholder="+55 11 9 9999 9999" />
          </Field>
          <Field label="E-mail">
            <input className="input" defaultValue={user?.email ?? ""} />
          </Field>
          <Field label="CPF">
            <input className="input" placeholder="999.999.999-99" />
          </Field>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Link
              href="/perfil/editar/senha"
              className="btn btn-secondary text-center"
            >
              Alterar Senha
            </Link>
            <button className="btn">Salvar alterações</button>
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
