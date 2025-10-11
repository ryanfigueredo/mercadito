"use client";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

type Order = {
  id: string;
  status: string;
  createdAt: string;
  items: {
    quantity: number;
    unitPriceCents: number;
    product: { name: string };
  }[];
};

const tabs = [
  { key: "", label: "Todos" },
  { key: "PENDING", label: "Aguardando" },
  { key: "CONFIRMED", label: "Preparando" },
  { key: "SHIPPED", label: "Enviados" },
  { key: "DELIVERED", label: "Concluídos" },
];

export default function AdminPedidosPage() {
  const [status, setStatus] = useState<string>("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [q, setQ] = useState("");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);
  const [counts, setCounts] = useState<Record<string, number>>({});

  async function load(p = page) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    params.set("page", String(p));
    params.set("pageSize", String(pageSize));
    const res = await fetch(`/api/admin/orders?${params.toString()}`);
    const data = (await res.json()) as {
      orders: Order[];
      page: number;
      pageSize: number;
      total: number;
      counts: Record<string, number>;
    };
    setOrders(data.orders);
    setPage(data.page);
    setTotal(data.total);
    setCounts(data.counts);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const list = useMemo(() => {
    if (!q) return orders;
    const t = q.toLowerCase();
    return orders.filter((o) =>
      o.items.some((i) => i.product.name.toLowerCase().includes(t))
    );
  }, [orders, q]);

  const act = async (id: string, action: string) => {
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    load();
  };

  return (
    <div>
      <h1 className="h-title mb-3">Pedidos</h1>
      <Input
        left={<SearchIcon />}
        placeholder="Busque por um pedido ou item"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="mt-4 flex gap-4 text-sm">
        {tabs.map((t) => {
          const count = t.key ? counts[t.key] ?? 0 : counts.all ?? 0;
          return (
            <button
              key={t.key}
              onClick={() => {
                setStatus(t.key);
                setPage(1);
              }}
              className={
                status === t.key ? "text-black font-semibold" : "text-muted"
              }
            >
              {t.label}
              <span className="ml-1 text-xs">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 space-y-4">
        {list.map((o) => (
          <div key={o.id} className="rounded-2xl border bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Pedido {o.id.slice(0, 6)}</h3>
              <span className="text-sm text-muted">{o.status}</span>
            </div>
            <ul className="mt-2 text-sm text-muted">
              {o.items.slice(0, 3).map((i, idx) => (
                <li key={idx}>
                  {i.quantity}x {i.product.name}
                </li>
              ))}
            </ul>

            <div className="mt-3 flex gap-2">
              <Button variant="outline" onClick={() => act(o.id, "reject")}>
                Recusar
              </Button>
              <Button onClick={() => act(o.id, "accept")}>Aceitar</Button>
              <Button variant="outline" onClick={() => act(o.id, "ship")}>
                Enviar
              </Button>
              <Button variant="outline" onClick={() => act(o.id, "deliver")}>
                Entregue
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted">
        <span>
          {Math.min((page - 1) * pageSize + 1, total)}-
          {Math.min(page * pageSize, total)} de {total}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => load(page - 1)}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page * pageSize >= total}
            onClick={() => load(page + 1)}
          >
            <span className="flex items-center gap-1">
              Próxima <ChevronRight size={16} />
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
