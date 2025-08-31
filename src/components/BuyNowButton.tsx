"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function BuyNowButton({
  id,
  name,
  unit_price,
}: {
  id: string;
  name: string;
  unit_price: number;
}) {
  const [loading, setLoading] = useState(false);
  const onClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              productId: id,
              title: name,
              quantity: 1,
              currency_id: "BRL",
              unit_price,
            },
          ],
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.id) {
        const msg = data?.error
          ? JSON.stringify(data.error)
          : "Erro ao criar preferência";
        throw new Error(msg);
      }
      const target =
        data.init_point ||
        `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${data.id}`;
      window.location.href = target;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={onClick} disabled={loading} className="w-full mt-3">
      {loading ? "Carregando..." : "Comprar agora"}
    </Button>
  );
}
