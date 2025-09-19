"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/lib/cart";
import Topbar from "@/components/Topbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PixPayment from "@/components/PixPayment";
import CreditCardPayment from "@/components/CreditCardPayment";

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total());
  const clear = useCart((s) => s.clear);
  const inc = useCart((s) => s.inc);
  const dec = useCart((s) => s.dec);

  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credit" | null>(
    null
  );
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    setPaymentError(null);
    clear();
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    setPaymentSuccess(false);
  };

  if (status === "loading") {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div>Carregando...</div>
      </div>
    );
  }

  if (!session) {
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
        </main>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-dvh">
        <Topbar />
        <main className="mx-auto max-w-sm px-4 pb-24">
          <div className="mt-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold mb-2">Pagamento Realizado!</h1>
            <p className="text-muted-foreground mb-6">
              Seu pedido foi processado com sucesso.
            </p>
            <Button asChild className="w-full">
              <Link href="/">Voltar ao início</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <Topbar />
      <main className="mx-auto max-w-sm px-4 pb-24">
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

        {paymentError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{paymentError}</p>
          </div>
        )}

        {!paymentMethod && (
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold">Método de Pagamento</h2>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => setPaymentMethod("pix")}
                disabled={items.length === 0}
              >
                <div className="text-2xl">📱</div>
                <span className="text-sm">PIX</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => setPaymentMethod("credit")}
                disabled={items.length === 0}
              >
                <div className="text-2xl">💳</div>
                <span className="text-sm">Cartão</span>
              </Button>
            </div>
          </div>
        )}

        {paymentMethod === "pix" && (
          <div className="mt-6">
            <Button
              variant="ghost"
              onClick={() => setPaymentMethod(null)}
              className="mb-4"
            >
              ← Voltar
            </Button>
            <PixPayment
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        )}

        {paymentMethod === "credit" && (
          <div className="mt-6">
            <Button
              variant="ghost"
              onClick={() => setPaymentMethod(null)}
              className="mb-4"
            >
              ← Voltar
            </Button>
            <CreditCardPayment
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        )}

        {!paymentMethod && (
          <div className="mt-4 flex gap-2">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">Voltar</Link>
            </Button>
          </div>
        )}

        <button className="mt-3 text-sm underline" onClick={clear}>
          Esvaziar carrinho
        </button>
      </main>
    </div>
  );
}
