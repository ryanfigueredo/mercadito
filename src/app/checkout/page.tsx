"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/lib/cart";
import Topbar from "@/components/Topbar";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import PaymentModal from "@/components/PaymentModal";
import AddressSelector, { type Address } from "@/components/AddressSelector";
import ShippingCalculator from "@/components/ShippingCalculator";
import {
  CreditCard,
  Truck,
  CheckCircle,
  ShoppingCart,
  ArrowLeft,
  Minus,
  Plus,
  ArrowRight,
} from "lucide-react";

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

  const [step, setStep] = useState<"address" | "payment">("address");
  const [paymentMethod, setPaymentMethod] = useState<
    "pix" | "credit" | "delivery" | null
  >(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [shippingInfo, setShippingInfo] = useState<{
    rateCents: number;
    rateReais: number;
    distanceKm: number;
    estimatedDays: number;
  } | null>(null);
  const [shippingError, setShippingError] = useState<string | null>(null);

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    setPaymentError(null);
    setShowPaymentModal(false);
    clear();
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    setPaymentSuccess(false);
  };

  const handleShippingCalculated = (shipping: any) => {
    setShippingInfo(shipping);
    setShippingError(null);
  };

  const handleShippingError = (error: string) => {
    setShippingError(error);
    setShippingInfo(null);
  };

  const handlePaymentMethodSelect = (method: "pix" | "credit" | "delivery") => {
    setPaymentMethod(method);
    setShowPaymentModal(true);
  };

  const handleCloseModal = () => {
    setShowPaymentModal(false);
    setPaymentMethod(null);
  };

  const handleContinueToPayment = () => {
    if (selectedAddress) {
      setStep("payment");
    }
  };

  const handleBackToAddress = () => {
    setStep("address");
    setPaymentMethod(null);
  };

  const loadUserAddresses = async () => {
    try {
      const response = await fetch("/api/user/addresses");
      if (response.ok) {
        const addresses = await response.json();
        setUserAddresses(addresses);
      }
    } catch (error) {
      console.error("Erro ao carregar endereços:", error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleAddressCreate = async (addressData: Omit<Address, "id">) => {
    const response = await fetch("/api/user/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addressData),
    });

    if (!response.ok) {
      throw new Error("Erro ao criar endereço");
    }

    const newAddress = await response.json();
    setUserAddresses([...userAddresses, newAddress]);
    setSelectedAddress(newAddress);
  };

  useEffect(() => {
    if (session) {
      loadUserAddresses();
    }
  }, [session]);

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
              <CheckCircle className="w-12 h-12 text-green-600" />
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
        <div className="flex items-center justify-between mt-4 mb-2">
          <h1 className="text-2xl font-bold">
            {step === "address" ? "Endereço de Entrega" : "Finalizar Pedido"}
          </h1>
          {step === "payment" && (
            <button
              onClick={handleBackToAddress}
              className="text-[#F8B075] font-medium text-sm flex items-center gap-1"
            >
              <ArrowLeft size={16} />
              Voltar
            </button>
          )}
        </div>

        {/* Resumo dos itens - sempre visível */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Resumo do Pedido</h2>
          <div className="rounded-2xl border bg-white overflow-hidden">
            {items.length === 0 && (
              <div className="p-6 text-center">
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
                  {step === "address" && (
                    <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50">
                      <button
                        type="button"
                        aria-label="Diminuir"
                        className="h-8 w-8 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-l-xl"
                        onClick={() => dec(i.id)}
                      >
                        <Minus size={16} />
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
                        <Plus size={16} />
                      </button>
                    </div>
                  )}
                  {step === "payment" && (
                    <span className="text-sm text-gray-600">{i.qty}x</span>
                  )}
                  <p className="font-semibold min-w-[80px] text-right text-gray-900">
                    R$ {(i.qty * i.price).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        {items.length > 0 && (
          <div className="mt-4 p-4 rounded-2xl bg-gray-50 border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">R$ {total.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Frete</span>
              <span className="font-medium">
                {shippingInfo
                  ? shippingInfo.rateReais === 0
                    ? "GRÁTIS"
                    : `R$ ${shippingInfo.rateReais.toFixed(2)}`
                  : "Calculando..."}
              </span>
            </div>
            <div className="border-t pt-2 flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-lg font-bold text-[#F8B075]">
                R$ {(total + (shippingInfo?.rateReais || 0)).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {paymentError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{paymentError}</p>
          </div>
        )}

        {/* Etapa 1: Seleção de Endereço */}
        {step === "address" && items.length > 0 && (
          <div className="mt-6">
            {loadingAddresses ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-[#F8B075] border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Carregando endereços...</p>
              </div>
            ) : (
              <>
                <AddressSelector
                  userAddresses={userAddresses}
                  selectedAddress={selectedAddress}
                  onAddressSelect={setSelectedAddress}
                  onAddressCreate={handleAddressCreate}
                />

                {selectedAddress && (
                  <>
                    <ShippingCalculator
                      zipCode={selectedAddress.zip}
                      city={selectedAddress.city}
                      state={selectedAddress.state}
                      onShippingCalculated={handleShippingCalculated}
                      onError={handleShippingError}
                    />

                    <Button
                      onClick={handleContinueToPayment}
                      className="w-full h-12 mt-4 bg-[#F8B075] hover:bg-[#e69a66]"
                      disabled={!shippingInfo && !shippingError}
                    >
                      {shippingInfo
                        ? "Continuar para Pagamento"
                        : "Calculando frete..."}
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* Etapa 2: Seleção de Método de Pagamento */}
        {step === "payment" &&
          !paymentMethod &&
          items.length > 0 &&
          selectedAddress && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">
                Método de Pagamento
              </h2>

              <div className="space-y-3">
                <button
                  className="w-full p-4 rounded-2xl border-2 border-gray-200 bg-white hover:border-[#F8B075] hover:bg-orange-50 transition-all duration-200 flex items-center gap-4"
                  onClick={() => handlePaymentMethodSelect("pix")}
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center text-white text-xl">
                    <Image src="/pix.svg" alt="PIX" width={24} height={24} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-900">PIX</h3>
                    <p className="text-sm text-gray-500">
                      Pagamento instantâneo
                    </p>
                  </div>
                  <ArrowRight size={16} className="text-gray-400" />
                </button>

                <button
                  className="w-full p-4 rounded-2xl border-2 border-gray-200 bg-white hover:border-[#F8B075] hover:bg-orange-50 transition-all duration-200 flex items-center gap-4"
                  onClick={() => handlePaymentMethodSelect("credit")}
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center text-white text-xl">
                    <CreditCard width={24} height={24} className="text-black" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-900">
                      Cartão de Crédito
                    </h3>
                    <p className="text-sm text-gray-500">
                      Parcelamento disponível
                    </p>
                  </div>
                  <ArrowRight size={16} className="text-gray-400" />
                </button>

                <button
                  className="w-full p-4 rounded-2xl border-2 border-gray-200 bg-white hover:border-[#F8B075] hover:bg-orange-50 transition-all duration-200 flex items-center gap-4"
                  onClick={() => handlePaymentMethodSelect("delivery")}
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center text-white text-xl">
                    <Truck width={24} height={24} className="text-black" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-900">
                      Pagamento na Entrega
                    </h3>
                    <p className="text-sm text-gray-500">
                      Pague diretamente ao entregador
                    </p>
                  </div>
                  <ArrowRight size={16} className="text-gray-400" />
                </button>
              </div>
            </div>
          )}

        {/* Modal de Pagamento */}
        {selectedAddress && shippingInfo && (
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={handleCloseModal}
            paymentMethod={paymentMethod}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            deliveryAddress={{
              street: selectedAddress.street,
              city: selectedAddress.city,
              state: selectedAddress.state,
              zip: selectedAddress.zip,
            }}
            shippingInfo={shippingInfo}
          />
        )}

        {/* Ações do carrinho */}
        {step === "address" && !paymentMethod && (
          <div className="mt-6 space-y-3">
            <Button
              asChild
              variant="outline"
              className="w-full h-12 rounded-2xl"
            >
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft size={16} />
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
