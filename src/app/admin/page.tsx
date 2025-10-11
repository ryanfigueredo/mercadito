import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  ShoppingCartIcon,
  PackageIcon,
  TrendingUpIcon,
  DollarSignIcon,
} from "@/components/ui/icons";
import {
  ArrowRight,
  AlertTriangle,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default async function AdminHome() {
  // Buscar estatísticas detalhadas
  const [
    totalOrders,
    pendingOrders,
    completedOrders,
    totalProducts,
    lowStockProducts,
    totalUsers,
    totalRevenue,
    recentOrders,
    monthlyRevenue,
  ] = await Promise.all([
    // Total de pedidos
    prisma.order.count(),

    // Pedidos pendentes
    prisma.order.count({ where: { status: "PENDING" } }),

    // Pedidos concluídos
    prisma.order.count({ where: { status: "DELIVERED" } }),

    // Total de produtos
    prisma.product.count(),

    // Produtos com estoque baixo (menos de 10)
    prisma.product.count({ where: { stock: { lt: 10 } } }),

    // Total de usuários
    prisma.user.count(),

    // Receita total (pedidos concluídos)
    prisma.order.aggregate({
      where: { status: "DELIVERED" },
      _sum: { totalCents: true },
    }),

    // Pedidos recentes (últimos 5)
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        items: {
          take: 1,
          include: { product: { select: { name: true } } },
        },
      },
    }),

    // Receita do mês atual
    prisma.order.aggregate({
      where: {
        status: "DELIVERED",
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { totalCents: true },
    }),
  ]);

  // Calcular valores monetários
  const totalRevenueValue = totalRevenue._sum.totalCents || 0;
  const monthlyRevenueValue = monthlyRevenue._sum.totalCents || 0;

  // Formatação de valores
  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);

  const stats = [
    {
      title: "Pedidos Pendentes",
      value: pendingOrders,
      icon: <Clock size={24} className="text-orange-600" />,
      href: "/admin/pedidos",
      urgent: pendingOrders > 0,
    },
    {
      title: "Receita Total",
      value: formatCurrency(totalRevenueValue),
      icon: <DollarSignIcon size={24} className="text-green-600" />,
      href: "/admin/pedidos",
    },
    {
      title: "Produtos Cadastrados",
      value: totalProducts,
      icon: <PackageIcon size={24} className="text-blue-600" />,
      href: "/admin/produtos",
    },
    {
      title: "Vendas do Mês",
      value: formatCurrency(monthlyRevenueValue),
      icon: <TrendingUpIcon size={24} className="text-purple-600" />,
      href: "/admin/pedidos",
    },
    {
      title: "Pedidos Concluídos",
      value: completedOrders,
      icon: <CheckCircle size={24} className="text-green-600" />,
      href: "/admin/pedidos",
    },
    {
      title: "Usuários Cadastrados",
      value: totalUsers,
      icon: <Users size={24} className="text-indigo-600" />,
      href: "/admin",
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
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
          {stats.map((stat) => (
            <Link
              key={stat.title}
              href={stat.href}
              className={`bg-white rounded-2xl p-4 lg:p-6 border hover:shadow-md transition-shadow ${
                stat.urgent ? "ring-2 ring-orange-200 bg-orange-50" : ""
              }`}
            >
              <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center bg-gray-100">
                  {stat.icon}
                </div>
                <div className="flex-1 min-w-0 lg:w-full">
                  <p className="text-xl lg:text-2xl font-bold text-gray-900">
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
                <ArrowRight size={16} className="text-gray-400" />
              </Link>
            ))}
          </div>
        </div>

        {/* Pedidos Recentes */}
        <div className="space-y-4">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
            Pedidos Recentes
          </h2>
          <div className="bg-white rounded-2xl border">
            {recentOrders.length > 0 ? (
              <div className="divide-y">
                {recentOrders.map((order) => (
                  <div key={order.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {order.user.name}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === "PENDING"
                                ? "bg-orange-100 text-orange-800"
                                : order.status === "SHIPPED"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {order.status === "PENDING"
                              ? "Pendente"
                              : order.status === "SHIPPED"
                              ? "Enviado"
                              : "Entregue"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {order.items[0]?.product.name}
                          {order.items.length > 1 &&
                            ` +${order.items.length - 1} itens`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString(
                            "pt-BR"
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(order.totalCents)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <ShoppingCartIcon
                  size={48}
                  className="mx-auto mb-3 text-gray-400"
                />
                <p className="text-gray-500">Nenhum pedido ainda</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alertas importantes */}
      <div className="space-y-4">
        {totalProducts === 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white">
                <AlertTriangle size={16} />
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

        {lowStockProducts > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white">
                <AlertTriangle size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-red-900">
                  {lowStockProducts} produtos com estoque baixo
                </h3>
                <p className="text-sm text-red-700">
                  <Link href="/admin/estoque" className="underline">
                    Verifique o estoque
                  </Link>{" "}
                  para evitar rupturas.
                </p>
              </div>
            </div>
          </div>
        )}

        {pendingOrders > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <Clock size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">
                  {pendingOrders} pedidos aguardando aprovação
                </h3>
                <p className="text-sm text-blue-700">
                  <Link href="/admin/pedidos" className="underline">
                    Processar pedidos
                  </Link>{" "}
                  para manter os clientes satisfeitos.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
