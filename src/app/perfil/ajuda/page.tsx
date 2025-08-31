import Topbar from "@/components/Topbar";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AjudaPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { addresses: true },
      })
    : null;

  const primaryAddress = user?.addresses[0];
  const addressLine = primaryAddress
    ? `${primaryAddress.street}, ${primaryAddress.city}`
    : undefined;

  return (
    <div className="min-h-dvh">
      <Topbar isLogged={!!user} address={addressLine} />
      <main className="mx-auto max-w-sm px-4 py-6">
        <div className="flex items-center justify-between mb-3">
          <h1 className="h-title">Ajuda e Suporte</h1>
          <Link href="/perfil" className="text-sm text-brand-600 font-semibold">
            Voltar
          </Link>
        </div>

        <section className="card p-4">
          <h2 className="font-semibold mb-2">Entre em contato</h2>
          <p className="text-sm text-muted">
            Escreva abaixo sua dúvida ou problema e entraremos em contato.
          </p>
          <textarea
            className="input mt-2 h-28"
            placeholder="Escreva sua dúvida ou problema"
          />
          <button className="btn mt-3">Enviar</button>
        </section>

        <section className="mt-4 rounded-2xl border p-4">
          <h2 className="font-semibold">Dúvidas frequentes</h2>
          <div className="mt-2 space-y-2 text-sm">
            {[1, 2, 3].map((i) => (
              <details key={i} className="rounded-xl border p-3">
                <summary className="font-medium cursor-pointer">
                  Lorem ipsum
                </summary>
                <p className="text-muted mt-1">
                  Conteúdo de ajuda exemplo. Curabitur nec pretium velit, vitae
                  pharetra ex.
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
