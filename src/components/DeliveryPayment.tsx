"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useSession } from "next-auth/react";
import { Truck } from "lucide-react";

interface DeliveryPaymentProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

export default function DeliveryPayment({
  onSuccess,
  onError,
  deliveryAddress,
}: DeliveryPaymentProps) {
  const [loading, setLoading] = useState(false);
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total());
  const { data: session } = useSession();

  const handleConfirmOrder = async () => {
    if (!session?.user?.email) {
      onError("Usuário não autenticado");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.qty,
          unitPriceCents: Math.round(item.price * 100),
        })),
        totalCents: Math.round(total * 100),
        shippingCents: 2000,
        paymentMethod: "delivery",
        deliveryAddress: deliveryAddress.street,
        deliveryCity: deliveryAddress.city,
        deliveryState: deliveryAddress.state,
        deliveryZip: deliveryAddress.zip,
      };

      const response = await fetch("/api/checkout/delivery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao confirmar pedido");
      }

      onSuccess();
    } catch (error) {
      onError(
        error instanceof Error ? error.message : "Erro ao confirmar pedido"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border p-4">
      <div className="text-center py-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
          <span className="text-2xl">
            <Truck width={24} height={24} className="text-black" />
          </span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Pagamento na Entrega
        </h3>

        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          Você pagará diretamente ao entregador no momento da entrega.
          <br />
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Subtotal</span>
            <span className="text-sm font-medium">R$ {total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Frete</span>
            <span className="text-sm font-medium">R$ 20,00</span>
          </div>
          <div className="border-t pt-2 flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total a pagar</span>
            <span className="text-lg font-bold text-[#F8B075]">
              R$ {(total + 20).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
          <p className="text-xs text-yellow-800">
            <strong>Importante:</strong> Tenha o valor exato ou próximo para
            facilitar o troco. O entregador pode não ter troco para valores
            altos.
            <br /> <br />
            Maquina de cartão aceita: <strong>Visa</strong>,{" "}
            <strong>Mastercard</strong>, <strong>Elo</strong>,{" "}
            <strong>American Express</strong>, <strong>Hipercard</strong> e{" "}
            <strong>Diners Club</strong>.
          </p>
        </div>

        <Button
          onClick={handleConfirmOrder}
          disabled={loading}
          className="w-full h-12 bg-[#F8B075] hover:bg-[#e69a66] text-white font-semibold"
        >
          {loading ? "Confirmando..." : "Confirmar Pedido"}
        </Button>
      </div>
    </div>
  );
}
