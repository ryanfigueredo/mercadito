"use client";
import { useCart } from "@/lib/cart";
import Topbar from "@/components/Topbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total());
  const clear = useCart((s) => s.clear);

  return (
    <div className="min-h-dvh">
      <Topbar isLogged={false} />
      <main className="mx-auto max-w-sm px-4 pb-24">
        <h1 className="h-title mt-4">Resumo</h1>
        <div className="mt-3 rounded-2xl border bg-white">
          {items.length === 0 && (
            <p className="p-4 text-sm text-muted">Seu carrinho está vazio.</p>
          )}
          {items.map((i) => (
            <div
              key={i.id}
              className="flex items-center justify-between p-4 border-b last:border-none"
            >
              <div>
                <p className="font-medium">{i.name}</p>
                <p className="text-sm text-muted">
                  {i.qty} x R$ {i.price.toFixed(2)}
                </p>
              </div>
              <p className="font-semibold">R$ {(i.qty * i.price).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-muted">Total</span>
          <span className="text-lg font-semibold">R$ {total.toFixed(2)}</span>
        </div>

        <div className="mt-4 flex gap-2">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/">Voltar</Link>
          </Button>
          <Button
            className="flex-1"
            disabled={items.length === 0}
            onClick={() => alert("Fluxo de pagamento na próxima etapa")}
          >
            Continuar
          </Button>
        </div>

        <button className="mt-3 text-sm underline" onClick={clear}>
          Esvaziar carrinho
        </button>
      </main>
    </div>
  );
}
