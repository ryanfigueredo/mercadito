"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Parâmetros retornados pelo Mercado Pago
  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");
  const externalReference = searchParams.get("external_reference");
  const merchantOrderId = searchParams.get("merchant_order_id");
  const preferenceId = searchParams.get("preference_id");

  useEffect(() => {
    // Buscar dados do pedido usando external_reference
    if (externalReference) {
      fetchOrderData(externalReference);
    } else {
      setLoading(false);
    }
  }, [externalReference]);

  async function fetchOrderData(orderId: string) {
    try {
      const response = await fetch(`/api/checkout/status/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrderData(data);
      }
    } catch (error) {
      console.error("Erro ao buscar dados do pedido:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando seu pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Pagamento Aprovado!
            </h1>
            <p className="text-gray-600">
              Seu pagamento foi processado com sucesso.
            </p>
          </div>

          {/* Informações do pagamento */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">
              Detalhes do Pagamento
            </h3>
            <div className="space-y-2 text-sm">
              {paymentId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">ID do Pagamento:</span>
                  <span className="font-mono text-gray-900">{paymentId}</span>
                </div>
              )}
              {status && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600 font-semibold capitalize">
                    {status}
                  </span>
                </div>
              )}
              {externalReference && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Pedido:</span>
                  <span className="font-mono text-gray-900">
                    #{externalReference}
                  </span>
                </div>
              )}
              {merchantOrderId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Ordem Mercado Pago:</span>
                  <span className="font-mono text-gray-900">
                    {merchantOrderId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Informações do pedido */}
          {orderData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">
                Detalhes do Pedido
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-semibold text-gray-900">
                    R$ {(orderData.totalCents / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frete:</span>
                  <span className="font-semibold text-gray-900">
                    R$ {(orderData.shippingCents / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Método:</span>
                  <span className="font-semibold text-gray-900">
                    {orderData.paymentMethod === "mercadopago_pix"
                      ? "PIX"
                      : "Cartão de Crédito"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Próximos passos */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              Próximos Passos
            </h3>
            <p className="text-gray-600 text-sm">
              Você receberá um e-mail de confirmação em breve. Seu pedido será
              processado e enviado para o endereço informado.
            </p>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/pedidos" className="flex-1">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Ver Meus Pedidos
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Continuar Comprando
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
