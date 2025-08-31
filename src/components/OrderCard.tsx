"use client";
import { useState } from "react";
import { Order, orderTotals, formatBRL } from "@/lib/orders";
import { X } from "lucide-react";

export default function OrderCard({ order }: { order: Order }) {
  const { qty, total } = orderTotals(order);
  const maxVisible = 2;
  const hiddenCount = Math.max(0, order.items.length - maxVisible);
  const [open, setOpen] = useState(false);
  const isPending =
    (order.status as string) === "AWAITING_CUSTOMER_CONFIRMATION" ||
    (order.status as string) === "PENDING";
  return (
    <div className="rounded-2xl border border-gray-300 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-lg font-semibold">Pedido #{order.number}</h3>
      </div>
      <div className="px-4">
        <div className="grid grid-cols-12 text-sm text-muted">
          <div className="col-span-9 py-1 font-medium text-black">Item</div>
          <div className="col-span-3 py-1 text-right">Qtd</div>
        </div>
        <div className="h-px bg-gray-200 my-1" />
        {order.items.slice(0, maxVisible).map((it, i) => (
          <div key={i} className="grid grid-cols-12 text-sm">
            <div className="col-span-9 py-1 truncate">{it.name}</div>
            <div className="col-span-3 py-1 text-right">{it.qty}</div>
          </div>
        ))}
        {hiddenCount > 0 && (
          <div className="text-sm text-muted py-1">+{hiddenCount} itens</div>
        )}
        <div className="h-px bg-gray-200 my-1" />
        <div className="text-sm font-medium">Total de itens: {qty}</div>
      </div>
      <div className="h-px bg-gray-200 my-3" />
      <div className="px-4 pb-3 text-sm">
        <div className="mt-1 flex items-center justify-between">
          <p className="text-muted">
            {new Date(order.createdAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
            })}
          </p>
          <button
            type="button"
            className={`text-sm underline underline-offset-2 hover:underline-offset-4 ${
              isPending ? "text-brand-600" : "text-muted"
            }`}
            onClick={() => setOpen(true)}
          >
            Detalhes
          </button>
          <span className="text-sm text-muted">
            {new Date(order.createdAt).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {"  •  "}
            {qty} itens
          </span>
        </div>
      </div>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full sm:max-w-md rounded-2xl mx-4 sm:mx-auto bg-white p-4 max-h-[90dvh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Pedido #{order.number}</h3>
              <button
                type="button"
                aria-label="Fechar"
                className="p-1"
                onClick={() => setOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-muted mt-1">
              {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}{" "}
              {new Date(order.createdAt).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>

            <div className="h-px bg-gray-200 my-3" />
            <div className="grid grid-cols-12 text-sm text-muted">
              <div className="col-span-7 py-1 font-medium text-black">Item</div>
              <div className="col-span-1 py-1 text-center">Qtd</div>
              <div className="col-span-2 py-1 text-right">Valor Un</div>
              <div className="col-span-2 py-1 text-right">Valor Total</div>
            </div>
            <div className="h-px bg-gray-200 my-1" />
            {order.items.map((it, i) => (
              <div key={i} className="grid grid-cols-12 text-sm">
                <div className="col-span-7 py-1">{it.name}</div>
                <div className="col-span-1 py-1 text-center">{it.qty}</div>
                <div className="col-span-2 py-1 text-right">
                  {formatBRL(it.unitPrice)}
                </div>
                <div className="col-span-2 py-1 text-right">
                  {formatBRL(it.qty * it.unitPrice)}
                </div>
              </div>
            ))}
            <div className="h-px bg-gray-200 my-1" />
            <div className="grid grid-cols-12 text-sm font-medium">
              <div className="col-span-7 py-1">Total</div>
              <div className="col-span-1 py-1 text-center">{qty}</div>
              <div className="col-span-2 py-1 text-right">Frete</div>
              <div className="col-span-2 py-1 text-right">
                {formatBRL(order.freight)}
              </div>
            </div>
            <div className="grid grid-cols-12 text-sm font-semibold">
              <div className="col-span-10 py-1">Total do pedido</div>
              <div className="col-span-2 py-1 text-right">
                {formatBRL(total)}
              </div>
            </div>

            {order.address && (
              <div className="mt-3 text-sm text-muted">
                <p>
                  {order.address.label} - {order.address.line}
                  {order.address.distanceKm
                    ? ` - ${order.address.distanceKm}km`
                    : ""}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
