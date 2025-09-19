"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/lib/cart";
import type { PaymentData, CardData } from "@/types";

interface CreditCardPaymentProps {
  onSuccess: (data: PaymentData) => void;
  onError: (error: string) => void;
}

export default function CreditCardPayment({
  onSuccess,
  onError,
}: CreditCardPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState<CardData>({
    number: "",
    holderName: "",
    expMonth: "",
    expYear: "",
    cvv: "",
    installments: 1,
    zipCode: "",
    city: "",
    state: "",
  });
  const items = useCart((s) => s.items);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/checkout/pagarme-credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.qty,
          })),
          cardData: {
            number: cardData.number.replace(/\s/g, ""),
            holderName: cardData.holderName,
            expMonth: cardData.expMonth,
            expYear: cardData.expYear,
            cvv: cardData.cvv,
            installments: cardData.installments,
            billingAddress: {
              line1: "Endereço de cobrança",
              zipCode: cardData.zipCode,
              city: cardData.city,
              state: cardData.state,
            },
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar pagamento");
      }

      onSuccess(data);
    } catch (error: unknown) {
      onError(
        error instanceof Error ? error.message : "Erro ao processar pagamento"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, "")
      .replace(/(\d{4})(?=\d)/g, "$1 ")
      .substring(0, 19);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Cartão de Crédito</h3>
        <p className="text-sm text-muted-foreground">
          Pagamento seguro com cartão
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="cardNumber">Número do Cartão</Label>
          <Input
            id="cardNumber"
            type="text"
            placeholder="0000 0000 0000 0000"
            value={cardData.number}
            onChange={(e) =>
              setCardData({
                ...cardData,
                number: formatCardNumber(e.target.value),
              })
            }
            maxLength={19}
            required
          />
        </div>

        <div>
          <Label htmlFor="holderName">Nome no Cartão</Label>
          <Input
            id="holderName"
            type="text"
            placeholder="Nome como está no cartão"
            value={cardData.holderName}
            onChange={(e) =>
              setCardData({
                ...cardData,
                holderName: e.target.value.toUpperCase(),
              })
            }
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label htmlFor="expMonth">Mês</Label>
            <Input
              id="expMonth"
              type="text"
              placeholder="MM"
              value={cardData.expMonth}
              onChange={(e) =>
                setCardData({
                  ...cardData,
                  expMonth: e.target.value.replace(/\D/g, "").substring(0, 2),
                })
              }
              maxLength={2}
              required
            />
          </div>
          <div>
            <Label htmlFor="expYear">Ano</Label>
            <Input
              id="expYear"
              type="text"
              placeholder="AAAA"
              value={cardData.expYear}
              onChange={(e) =>
                setCardData({
                  ...cardData,
                  expYear: e.target.value.replace(/\D/g, "").substring(0, 4),
                })
              }
              maxLength={4}
              required
            />
          </div>
          <div>
            <Label htmlFor="cvv">CVV</Label>
            <Input
              id="cvv"
              type="text"
              placeholder="000"
              value={cardData.cvv}
              onChange={(e) =>
                setCardData({
                  ...cardData,
                  cvv: e.target.value.replace(/\D/g, "").substring(0, 3),
                })
              }
              maxLength={3}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="installments">Parcelas</Label>
          <select
            id="installments"
            className="w-full p-2 border rounded-md"
            value={cardData.installments}
            onChange={(e) =>
              setCardData({
                ...cardData,
                installments: parseInt(e.target.value) || 1,
              })
            }
            required
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
              <option key={num} value={num}>
                {num}x de R${" "}
                {(items.reduce((sum, item) => sum + item.price * item.qty, 0) +
                  20) /
                  num}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="zipCode">CEP</Label>
            <Input
              id="zipCode"
              type="text"
              placeholder="00000-000"
              value={cardData.zipCode}
              onChange={(e) =>
                setCardData({
                  ...cardData,
                  zipCode: e.target.value.replace(/\D/g, "").substring(0, 8),
                })
              }
              maxLength={8}
              required
            />
          </div>
          <div>
            <Label htmlFor="state">Estado</Label>
            <Input
              id="state"
              type="text"
              placeholder="SP"
              value={cardData.state}
              onChange={(e) =>
                setCardData({
                  ...cardData,
                  state: e.target.value.toUpperCase(),
                })
              }
              maxLength={2}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            type="text"
            placeholder="São Paulo"
            value={cardData.city}
            onChange={(e) => setCardData({ ...cardData, city: e.target.value })}
            required
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Processando..." : "Finalizar Pagamento"}
        </Button>
      </form>
    </div>
  );
}
