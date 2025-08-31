import Topbar from "@/components/Topbar";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function TermosPage() {
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
          <h1 className="h-title">Termos de uso e Privacidade</h1>
          <Link href="/perfil" className="text-sm text-brand-600 font-semibold">
            Voltar
          </Link>
        </div>

        <article className="prose prose-sm max-w-none">
          <h2>Lorem ipsum dolor sit amet</h2>
          <p>
            Consectetur adipiscing elit. Curabitur nec pretium velit, vitae
            pharetra ex. Sed fermentum feugiat ligula, a venenatis eleifend
            ultricies. Curabitur neque arcu, orci a lorem ultrices, gravida
            massa. Nisl, eget dapibus purus.
          </p>
          <h3>Donec imperdiet</h3>
          <p>
            Vivamus a magna massa. Etiam eget dapibus purus. Etiam eget dapibus
            purus. Nullam pharetra lacinia.
          </p>
          <h3>Proin eu mattis leo</h3>
          <p>
            Donec feugiat orci at leo cursus, non accumsan lorem placerat.
            Integer pretium felis a aliquam viverra.
          </p>
        </article>
      </main>
    </div>
  );
}
