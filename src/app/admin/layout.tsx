import { requireAdmin } from "@/lib/admin";
import Topbar from "@/components/Topbar";
import Link from "next/link";
import {
  PackageIcon,
  ShoppingCartIcon,
  BarChart3Icon,
  UsersIcon,
} from "@/components/ui/icons";
import { Truck, RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificar se o usuário é admin
  const user = await requireAdmin();

  return (
    <div className="min-h-dvh bg-gray-50">
      <Topbar />

      {/* Admin Header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-sm lg:max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                Painel Admin
              </h1>
              <p className="text-sm lg:text-base text-gray-600">
                Olá, {user.name}
              </p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-[#F8B075] flex items-center justify-center">
              <span className="text-white font-semibold lg:text-lg">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Navigation */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-sm lg:max-w-6xl px-4">
          <nav className="flex space-x-1 lg:space-x-4 overflow-x-auto no-scrollbar py-2 lg:py-4">
            <AdminNavLink
              href="/admin"
              icon={<BarChart3Icon size={16} />}
              label="Dashboard"
            />
            <AdminNavLink
              href="/admin/pedidos"
              icon={<ShoppingCartIcon size={16} />}
              label="Pedidos"
            />
            <AdminNavLink
              href="/admin/produtos"
              icon={<PackageIcon size={16} />}
              label="Produtos"
            />
            <AdminNavLink
              href="/admin/estoque"
              icon={<UsersIcon size={16} />}
              label="Estoque"
            />
            <AdminNavLink
              href="/admin/frete"
              icon={<Truck size={16} />}
              label="Frete"
            />
            <AdminNavLink
              href="/admin/amc-integration"
              icon={<RefreshCw size={16} />}
              label="Integração AMC"
            />
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-sm lg:max-w-6xl px-4 pb-32">
        {children}
      </main>
    </div>
  );
}

function AdminNavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-sm lg:text-base font-medium whitespace-nowrap transition-colors hover:bg-gray-100 active:bg-gray-200"
    >
      {icon}
      {label}
    </Link>
  );
}
