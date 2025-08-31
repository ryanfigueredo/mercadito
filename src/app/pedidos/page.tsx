import Topbar from "@/components/Topbar";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import OrderCard from "@/components/OrderCard";
import { prisma } from "@/lib/prisma";

export default async function PedidosPage() {
  const user = await prisma.user.findUnique({
    where: { email: "dev@mercadito.local" },
  });
  const orders = user
    ? await prisma.order.findMany({
        where: { userId: user.id },
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      })
    : [];

  const current = orders.find((o) => o.status !== "DELIVERED");
  const history = orders.filter((o) => o.status === "DELIVERED");
  return (
    <div className="min-h-dvh">
      <Topbar isLogged address="Rua das Laranjeiras nº 100" />
      <main className="mx-auto max-w-sm px-4 pb-24">
        <h1 className="h-title my-4">Atual</h1>

        {current && (
          <>
            <div className="mb-3">
              <OrderStatusBadge
                status={current.status}
                text="Aguardando Confirmação do Cliente"
              />
            </div>
            {(() => {
              const itemsValueCents = current.items.reduce(
                (s, it) => s + it.quantity * it.unitPriceCents,
                0
              );
              const freight = (current.totalCents - itemsValueCents) / 100;
              return (
                <OrderCard
                  order={{
                    id: current.id,
                    number: 3254,
                    status: "AWAITING_CUSTOMER_CONFIRMATION",
                    createdAt: current.createdAt.toISOString(),
                    address: {
                      label: "Minha Casa",
                      line: "Rua das Oliveiras nº 400, Jardim Campos",
                      distanceKm: 4.7,
                    },
                    freight,
                    items: current.items.map((it) => ({
                      name: it.product.name,
                      qty: it.quantity,
                      unitPrice: it.unitPriceCents / 100,
                    })),
                  }}
                />
              );
            })()}
          </>
        )}

        <h2 className="h-title my-4">Histórico</h2>

        {history.map((o) => (
          <div key={o.id} className="mt-4">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <OrderStatusBadge status={"DELIVERED"} text="Entregue" />
              </div>
              <div>
                <OrderStatusBadge
                  status={"DELIVERED"}
                  text={`Chegada: --:--`}
                />
              </div>
            </div>
            <OrderCard
              order={{
                id: o.id,
                number: 3000,
                status: "DELIVERED",
                createdAt: o.createdAt.toISOString(),
                address: {
                  label: "Minha Casa",
                  line: "Rua das Oliveiras nº 400, Jardim Campos",
                  distanceKm: 4.7,
                },
                freight:
                  o.totalCents / 100 -
                  o.items.reduce(
                    (s, it) => s + (it.quantity * it.unitPriceCents) / 100,
                    0
                  ),
                items: o.items.map((it) => ({
                  name: it.product.name,
                  qty: it.quantity,
                  unitPrice: it.unitPriceCents / 100,
                })),
              }}
            />
          </div>
        ))}
      </main>
    </div>
  );
}
