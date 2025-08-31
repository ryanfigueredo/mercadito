import Topbar from "@/components/Topbar";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function PagamentosPage() {
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
          <h1 className="h-title">Minhas Formas de Pagamento</h1>
          <Link href="/perfil" className="text-sm text-brand-600 font-semibold">
            Voltar
          </Link>
        </div>

        {/* Métodos existentes (placeholder) */}
        <div className="space-y-2 mb-4">
          {[
            "Final 5539 • Cartão de Débito",
            "Final 5539 • Cartão de Crédito",
            "Final 5539 • Cartão de Débito",
          ].map((txt, i) => (
            <label
              key={i}
              className="flex items-center gap-3 rounded-2xl border p-3"
            >
              <input type="radio" name="card" className="h-4 w-4" />
              <span className="text-sm">{txt}</span>
            </label>
          ))}
        </div>

        {/* Adicionar novo cartão */}
        <section className="card p-4 space-y-3">
          <h2 className="font-semibold">Adicionar Forma de Pagamento</h2>
          <Field label="Número do Cartão">
            <input className="input" placeholder="Insira o número do cartão" />
          </Field>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <Field label="Data de Vencimento">
                <input className="input" placeholder="MM/AA" />
              </Field>
            </div>
            <div>
              <Field label="CVV">
                <input className="input" placeholder="---" />
              </Field>
            </div>
          </div>
          <Field label="Nome no cartão">
            <input className="input" placeholder="Insira o nome impresso" />
          </Field>
          <Field label="CPF">
            <input className="input" placeholder="Insira o CPF do titular" />
          </Field>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button className="btn btn-secondary">Adicionar Cartão</button>
            <button className="btn">Salvar</button>
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
