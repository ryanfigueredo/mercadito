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

  // Verificação de hidratação
  if (typeof window === "undefined") {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div>Carregando...</div>
      </div>
    );
  }

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
        <main className="mx-auto max-w-sm px-4 pb-32">
          <div className="mt-4 rounded-2xl border border-black-500 p-3 bg-black-50">
            <p className="text-sm">
              Entre na sua conta para finalizar a compra.
              <Link
                href={`/auth/login?callbackUrl=${encodeURIComponent(
                  "/checkout"
                )}`}
                className="ml-2 font-semibold text-black underline"
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
        <main className="mx-auto max-w-sm px-4 pb-32">
          <div className="mt-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <div className="text-3xl">✅</div>
            </div>
            <h1 className="text-2xl font-bold mb-3 text-gray-900">
              Pedido Confirmado!
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Seu pagamento foi processado com sucesso.
              <br />
              Em breve você receberá a confirmação por email.
            </p>

            <div className="space-y-3">
              <Button
                asChild
                className="w-full h-12 rounded-2xl bg-[#F8B075] hover:bg-[#e69a66]"
              >
                <Link href="/pedidos">Ver Meus Pedidos</Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full h-12 rounded-2xl"
              >
                <Link href="/">Continuar Comprando</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <Topbar />
      <main className="mx-auto max-w-sm px-4 pb-32">
        <h1 className="text-2xl font-bold mt-4">Finalizar Pedido</h1>

        {/* Resumo dos itens */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Resumo do Pedido</h2>
          <div className="rounded-2xl border bg-white overflow-hidden">
            {items.length === 0 && (
              <div className="p-6 text-center">
                <div className="text-4xl mb-2">🛒</div>
                <p className="text-gray-500">Seu carrinho está vazio</p>
              </div>
            )}
            {items.map((i) => (
              <div
                key={i.id}
                className="flex items-center justify-between p-4 border-b last:border-none gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate text-gray-900">{i.name}</p>
                  <p className="text-sm text-gray-500">
                    R$ {i.price.toFixed(2)} cada
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50">
                    <button
                      type="button"
                      aria-label="Diminuir"
                      className="h-8 w-8 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-l-xl"
                      onClick={() => dec(i.id)}
                    >
                      −
                    </button>
                    <span className="px-3 text-sm min-w-[40px] text-center font-medium">
                      {i.qty}
                    </span>
                    <button
                      type="button"
                      aria-label="Aumentar"
                      className="h-8 w-8 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-r-xl"
                      onClick={() => inc(i.id)}
                    >
                      +
                    </button>
                  </div>
                  <p className="font-semibold min-w-[80px] text-right text-gray-900">
                    R$ {(i.qty * i.price).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="mt-4 p-4 rounded-2xl bg-gray-50 border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">R$ {total.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Frete</span>
            <span className="font-medium">R$ 20,00</span>
          </div>
          <div className="border-t pt-2 flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-lg font-bold text-[#F8B075]">
              R$ {(total + 20).toFixed(2)}
            </span>
          </div>
        </div>

        {paymentError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{paymentError}</p>
          </div>
        )}

        {!paymentMethod && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Método de Pagamento</h2>

            <div className="space-y-3">
              <button
                className="w-full p-4 rounded-2xl border-2 border-gray-200 bg-white hover:border-[#F8B075] hover:bg-orange-50 transition-all duration-200 flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setPaymentMethod("pix")}
                disabled={items.length === 0}
              >
                <div className="w-12 h-12 rounded-xl bg-[#F8B075] flex items-center justify-center text-white text-xl">
                  📱
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-gray-900">PIX</h3>
                  <p className="text-sm text-gray-500">Pagamento instantâneo</p>
                </div>
                <div className="text-gray-400">→</div>
              </button>

              <button
                className="w-full p-4 rounded-2xl border-2 border-gray-200 bg-white hover:border-[#F8B075] hover:bg-orange-50 transition-all duration-200 flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setPaymentMethod("credit")}
                disabled={items.length === 0}
              >
                <div className="w-12 h-12 rounded-xl bg-[#F8B075] flex items-center justify-center text-white text-xl">
                  💳
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-gray-900">
                    Cartão de Crédito
                  </h3>
                  <p className="text-sm text-gray-500">
                    Parcelamento disponível
                  </p>
                </div>
                <div className="text-gray-400">→</div>
              </button>
            </div>
          </div>
        )}

        {paymentMethod === "pix" && (
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setPaymentMethod(null)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                ←
              </button>
              <h2 className="text-lg font-semibold">Pagamento PIX</h2>
            </div>
            <PixPayment
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        )}

        {paymentMethod === "credit" && (
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setPaymentMethod(null)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                ←
              </button>
              <h2 className="text-lg font-semibold">Cartão de Crédito</h2>
            </div>
            <CreditCardPayment
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        )}

        {!paymentMethod && (
          <div className="mt-6 space-y-3">
            <Button
              asChild
              variant="outline"
              className="w-full h-12 rounded-2xl"
            >
              <Link href="/">
                <span className="mr-2">←</span>
                Continuar Comprando
              </Link>
            </Button>

            {items.length > 0 && (
              <button
                className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
                onClick={clear}
              >
                Esvaziar carrinho
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
