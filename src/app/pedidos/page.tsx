import Topbar from "@/components/Topbar";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import OrderCard from "@/components/OrderCard";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PedidosPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { addresses: true },
  });

  if (!user) {
    redirect("/auth/login");
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
    take: 50, // Aumentar limite para ver mais pedidos
  });

  const current = orders.filter((o) => 
    o.status !== "DELIVERED" && o.status !== "CANCELED"
  );
  const history = orders.filter((o) => 
    o.status === "DELIVERED" || o.status === "CANCELED"
  );

  const primaryAddress = user.addresses[0];
  const addressLine = primaryAddress
    ? `${primaryAddress.street}, ${primaryAddress.city}`
    : undefined;

  return (
    <div className="min-h-dvh">
      <Topbar isLogged={true} address={addressLine} />
      <main className="mx-auto max-w-sm px-4 pb-32">
        {current.length > 0 && (
          <>
            <h1 className="h-title my-4">Atual</h1>
            {current.map((order) => {
              const itemsValueCents = order.items.reduce(
                (s, it) => s + it.quantity * it.unitPriceCents,
                0
              );
              const freight = order.shippingCents / 100;
              return (
                <div key={order.id} className="mb-4">
                  <div className="mb-3">
                    <OrderStatusBadge
                      status={order.status}
                      text={
                        order.status === "PENDING"
                          ? "Aguardando Pagamento"
                          : order.status === "CONFIRMED"
                          ? "Confirmado"
                          : order.status === "SHIPPED"
                          ? "Enviado"
                          : order.status === "DELIVERED"
                          ? "Entregue"
                          : order.status === "CANCELED"
                          ? "Cancelado"
                          : "Aguardando"
                      }
                    />
                  </div>
                  <OrderCard
                    order={{
                      id: order.id,
                      number: parseInt(order.id.slice(-4), 16) || 0,
                      status: order.status,
                      createdAt: order.createdAt.toISOString(),
                      address: {
                        label: "Entrega",
                        line: `${order.deliveryAddress}, ${order.deliveryCity} - ${order.deliveryState}`,
                      },
                      freight,
                      items: order.items.map((it) => ({
                        name: it.product.name,
                        qty: it.quantity,
                        unitPrice: it.unitPriceCents / 100,
                      })),
                    }}
                  />
                </div>
              );
            })}
          </>
        )}

        <h2 className="h-title my-4">Histórico</h2>

        {history.length === 0 && current.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted">Você ainda não fez nenhum pedido.</p>
          </div>
        ) : (
          history.map((o) => {
            const itemsValueCents = o.items.reduce(
              (s, it) => s + it.quantity * it.unitPriceCents,
              0
            );
            const freight = o.shippingCents / 100;
            return (
              <div key={o.id} className="mt-4">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <OrderStatusBadge
                      status={o.status}
                      text={
                        o.status === "DELIVERED"
                          ? "Entregue"
                          : o.status === "CANCELED"
                          ? "Cancelado"
                          : o.status
                      }
                    />
                  </div>
                  <div>
                    <OrderStatusBadge
                      status={o.status}
                      text={`Data: ${new Date(o.createdAt).toLocaleDateString("pt-BR")}`}
                    />
                  </div>
                </div>
                <OrderCard
                  order={{
                    id: o.id,
                    number: parseInt(o.id.slice(-4), 16) || 0,
                    status: o.status,
                    createdAt: o.createdAt.toISOString(),
                    address: {
                      label: "Entrega",
                      line: `${o.deliveryAddress}, ${o.deliveryCity} - ${o.deliveryState}`,
                    },
                    freight,
                    items: o.items.map((it) => ({
                      name: it.product.name,
                      qty: it.quantity,
                      unitPrice: it.unitPriceCents / 100,
                    })),
                  }}
                />
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}
