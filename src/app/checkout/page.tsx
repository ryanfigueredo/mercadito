"use client";
export const dynamic = "force-dynamic";
import { useCart } from "@/lib/cart";
import Topbar from "@/components/Topbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total());
  const clear = useCart((s) => s.clear);
  const inc = useCart((s) => s.inc);
  const dec = useCart((s) => s.dec);

  return (
    <div className="min-h-dvh">
      <Topbar />
      <main className="mx-auto max-w-sm px-4 pb-24">
        <div className="mt-4 rounded-2xl border border-brand-500 p-3 bg-brand-50">
          <p className="text-sm">
            Entre na sua conta para finalizar a compra.
            <Link
              href={`/auth/login?callbackUrl=${encodeURIComponent(
                "/checkout"
              )}`}
              className="ml-2 font-semibold text-brand-600 underline"
            >
              Fazer login
            </Link>
          </p>
        </div>
        <h1 className="h-title mt-4">Resumo</h1>
        <div className="mt-3 rounded-2xl border bg-white">
          {items.length === 0 && (
            <p className="p-4 text-sm text-muted">Seu carrinho está vazio.</p>
          )}
          {items.map((i) => (
            <div
              key={i.id}
              className="flex items-center justify-between p-4 border-b last:border-none gap-3"
            >
              <div className="min-w-0">
                <p className="font-medium truncate">{i.name}</p>
                <p className="text-sm text-muted">R$ {i.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-xl border border-gray-300">
                  <button
                    type="button"
                    aria-label="Diminuir"
                    className="h-8 w-8"
                    onClick={() => dec(i.id)}
                  >
                    −
                  </button>
                  <span className="px-2 text-sm min-w-[20px] text-center">
                    {i.qty}
                  </span>
                  <button
                    type="button"
                    aria-label="Aumentar"
                    className="h-8 w-8"
                    onClick={() => inc(i.id)}
                  >
                    +
                  </button>
                </div>
                <p className="font-semibold min-w-[90px] text-right">
                  R$ {(i.qty * i.price).toFixed(2)}
                </p>
              </div>
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
