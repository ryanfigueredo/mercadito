import Topbar from "@/components/Topbar";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  PencilIcon,
  CreditCardIcon,
  MapPinIcon,
  SettingsIcon,
  ShieldIcon,
  FileTextIcon,
  HelpCircleIcon,
  LogOutIcon,
  BarChart3Icon,
} from "@/components/ui/icons";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

type IconComponent = (props: {
  size?: number;
  className?: string;
}) => React.ReactElement;

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
      <span className="text-muted">›</span>
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
              <div className="p-4 flex items-center gap-3">
                <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200">
                  <Image
                    src="/next.svg"
                    alt="avatar"
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{dbUser.name}</p>
                  <p className="text-sm text-muted truncate">{dbUser.email}</p>
                </div>
              </div>
            </section>

            <nav className="mt-4 rounded-2xl border divide-y">
              {dbUser.isAdmin && (
                <MenuItem
                  href="/admin"
                  Icon={BarChart3Icon}
                  label="Acessar Admin"
                />
              )}

              <MenuItem
                href="/perfil/editar"
                Icon={PencilIcon}
                label="Editar Perfil"
              />
              <MenuItem
                href="/perfil/pagamentos"
                Icon={CreditCardIcon}
                label="Métodos de Pagamento"
              />
              <MenuItem
                href="/perfil/enderecos"
                Icon={MapPinIcon}
                label="Endereços"
              />
              <MenuItem
                href="/perfil/configuracoes"
                Icon={SettingsIcon}
                label="Configurações"
              />
              <MenuItem
                href="/perfil/privacidade"
                Icon={ShieldIcon}
                label="Privacidade"
              />
              <MenuItem
                href="/perfil/termos"
                Icon={FileTextIcon}
                label="Termos e Condições"
              />
              <MenuItem
                href="/perfil/ajuda"
                Icon={HelpCircleIcon}
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
