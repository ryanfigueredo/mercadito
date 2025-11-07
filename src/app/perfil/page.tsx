import Topbar from "@/components/Topbar";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  PenTool,
  CreditCard,
  MapPin,
  FileText,
  HelpCircle,
  LogOut,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

type IconComponent = LucideIcon;

function MenuItem({
  href,
  Icon,
  label,
}: {
  href: string;
  Icon: IconComponent;
  label: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 p-4 ">
      <Icon size={18} className="text-muted" />
      <span className="flex-1">{label}</span>
      <ChevronRight size={16} className="text-muted" />
    </Link>
  );
}

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);
  const dbUser = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          name: true,
          email: true,
          isAdmin: true,
          addresses: true,
        },
      })
    : null;

  if (!dbUser) {
    redirect("/auth/login");
  }

  const primaryAddress = dbUser?.addresses[0];
  const addressLine = primaryAddress
    ? `${primaryAddress.street}, ${primaryAddress.city}`
    : undefined;

  return (
    <div className="min-h-dvh">
      <Topbar isLogged={!!dbUser} address={addressLine} />
      <main className="mx-auto max-w-sm px-4 py-6">
        <h1 className="h-title mb-3">Meu Perfil</h1>

        {!dbUser && (
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-muted">Você não está logado.</p>
            <Link
              href="/auth/login"
              className="mt-2 inline-block font-semibold text-black"
            >
              Fazer login
            </Link>
          </div>
        )}

        {dbUser && (
          <>
            <section className="relative overflow-hidden rounded-2xl bg-black-50">
              <div className="p-4">
                <div className="min-w-0">
                  <p className="font-semibold text-lg">{dbUser.name}</p>
                  <p className="text-sm text-muted">{dbUser.email}</p>
                </div>
              </div>
            </section>

            <nav className="mt-4 rounded-2xl border divide-y">
              {dbUser.isAdmin && (
                <MenuItem
                  href="/admin"
                  Icon={BarChart3}
                  label="Acessar Admin"
                />
              )}

              <MenuItem
                href="/perfil/editar"
                Icon={PenTool}
                label="Editar Perfil"
              />
              <MenuItem
                href="/perfil/pagamentos"
                Icon={CreditCard}
                label="Métodos de Pagamento"
              />
              <MenuItem
                href="/perfil/enderecos"
                Icon={MapPin}
                label="Endereços"
              />
              <MenuItem
                href="/perfil/termos"
                Icon={FileText}
                label="Termos e Condições"
              />
              <MenuItem
                href="/perfil/ajuda"
                Icon={HelpCircle}
                label="Ajuda e Suporte"
              />

              <LogoutButton />
            </nav>
          </>
        )}
      </main>
    </div>
  );
}
