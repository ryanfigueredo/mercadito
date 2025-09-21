import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  ShoppingCartIcon,
  PackageIcon,
  TrendingUpIcon,
  DollarSignIcon,
} from "@/components/ui/icons";

export default async function AdminHome() {
  // Buscar estatísticas básicas
  const [totalOrders, pendingOrders, totalProducts] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.product.count(),
  ]);

  const stats = [
    {
      title: "Pedidos Pendentes",
      value: pendingOrders,
      icon: <ShoppingCartIcon size={24} />,
      href: "/admin/pedidos",
    },
    {
      title: "Total de Pedidos",
      value: totalOrders,
      icon: <TrendingUpIcon size={24} />,
      href: "/admin/pedidos",
    },
    {
      title: "Produtos Cadastrados",
      value: totalProducts,
      icon: <PackageIcon size={24} />,
      href: "/admin/produtos",
    },
    {
      title: "Vendas do Mês",
      value: "R$ 0,00",
      icon: <DollarSignIcon size={24} />,
      href: "/admin/pedidos",
    },
  ];

  const quickActions = [
    {
      href: "/admin/pedidos",
      title: "Gerenciar Pedidos",
      desc: "Aprovar, enviar e entregar",
      icon: <ShoppingCartIcon size={20} />,
    },
    {
      href: "/admin/produtos",
      title: "Produtos",
      desc: "Cadastrar e editar produtos",
      icon: <PackageIcon size={20} />,
    },
    {
      href: "/admin/produtos/novo",
      title: "Novo Produto",
      desc: "Adicionar produto ao catálogo",
      icon: <PackageIcon size={20} />,
    },
    {
      href: "/admin/estoque",
      title: "Controle de Estoque",
      desc: "Verificar quantidades",
      icon: <TrendingUpIcon size={20} />,
    },
  ];

  return (
    <div className="py-6 space-y-6">
      {/* Estatísticas */}
      <div className="space-y-4">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
          Resumo
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
          {stats.map((stat) => (
            <Link
              key={stat.title}
              href={stat.href}
              className="bg-white rounded-2xl p-4 lg:p-6 border hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-4">
                <div
                  className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center text-black`}
                >
                  {stat.icon}
                </div>
                <div className="flex-1 min-w-0 lg:w-full">
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs lg:text-sm text-gray-600 truncate">
                    {stat.title}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Layout responsivo para ações rápidas */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-8 space-y-6 lg:space-y-0">
        {/* Ações Rápidas */}
        <div className="space-y-4">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
            Ações Rápidas
          </h2>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="bg-white rounded-2xl p-4 lg:p-5 border hover:shadow-md transition-all duration-200 flex items-center gap-4"
              >
                <div
                  className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center text-white`}
                >
                  {action.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 lg:text-lg">
                    {action.title}
                  </h3>
                  <p className="text-sm lg:text-base text-gray-600">
                    {action.desc}
                  </p>
                </div>
                <div className="text-gray-400 lg:text-lg">→</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Espaço para futuras funcionalidades no desktop */}
        <div className="hidden lg:block space-y-4">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
            Atividade Recente
          </h2>
          <div className="bg-white rounded-2xl p-6 border">
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📊</div>
              <p className="text-gray-500">Em breve: gráficos e relatórios</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta se não houver produtos */}
      {totalProducts === 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm">
              ⚠️
            </div>
            <div>
              <h3 className="font-semibold text-orange-900">
                Nenhum produto cadastrado
              </h3>
              <p className="text-sm text-orange-700">
                <Link href="/admin/produtos/novo" className="underline">
                  Cadastre seu primeiro produto
                </Link>{" "}
                para começar a vender.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
