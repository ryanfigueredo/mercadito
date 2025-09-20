"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import type { PaymentData } from "@/types";

interface PixPaymentProps {
  onSuccess: (data: PaymentData) => void;
  onError: (error: string) => void;
}

export default function PixPayment({ onSuccess, onError }: PixPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<PaymentData | null>(null);
  const items = useCart((s) => s.items);

  const handlePixPayment = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/checkout/pagarme-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.qty,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar pagamento PIX");
      }

      setPixData(data);
      onSuccess(data);
    } catch (error: unknown) {
      onError(
        error instanceof Error ? error.message : "Erro ao processar pagamento"
      );
    } finally {
      setLoading(false);
    }
  };

  if (pixData) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Pagamento PIX</h3>
          <p className="text-sm text-muted-foreground">
            Escaneie o QR Code ou copie o código PIX
          </p>
        </div>

        {pixData.pixQrCodeUrl && (
          <div className="flex justify-center">
            <img
              src={pixData.pixQrCodeUrl}
              alt="QR Code PIX"
              className="w-64 h-64 border rounded-lg"
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Código PIX:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={pixData.pixQrCode || ""}
              readOnly
              className="flex-1 p-2 border rounded text-xs font-mono"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigator.clipboard.writeText(pixData.pixQrCode || "")
              }
            >
              Copiar
            </Button>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Valor: R$ {pixData.total.toFixed(2)}</p>
          <p>
            Expira em: {Math.floor((pixData.expiresIn || 3600) / 60)} minutos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Pagamento PIX</h3>
        <p className="text-sm text-muted-foreground">
          Pague instantaneamente com PIX
        </p>
      </div>

      <Button
        onClick={handlePixPayment}
        disabled={loading}
        className="w-full text-black"
      >
        {loading ? "Processando..." : "Gerar PIX"}
      </Button>
    </div>
  );
}
