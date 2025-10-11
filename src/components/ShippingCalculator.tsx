"use client";
import { useState, useEffect } from "react";
import { Truck, MapPin, Clock, AlertCircle } from "lucide-react";

interface ShippingCalculatorProps {
  zipCode: string;
  city?: string;
  state?: string;
  onShippingCalculated: (shipping: ShippingInfo) => void;
  onError: (error: string) => void;
}

interface ShippingInfo {
  rateCents: number;
  rateReais: number;
  distanceKm: number;
  estimatedDays: number;
  origin: {
    city: string;
    state: string;
  };
  destination: {
    zipCode: string;
    city?: string;
    state?: string;
  };
}

export default function ShippingCalculator({
  zipCode,
  city,
  state,
  onShippingCalculated,
  onError,
}: ShippingCalculatorProps) {
  const [loading, setLoading] = useState(false);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateShipping = async () => {
    if (!zipCode || zipCode.replace(/\D/g, "").length !== 8) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/shipping/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          zipCode: zipCode.replace(/\D/g, ""),
          city,
          state,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao calcular frete");
      }

      setShippingInfo(data.shipping);
      onShippingCalculated(data.shipping);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao calcular frete";
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculateShipping();
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [zipCode, city, state]);

  if (!zipCode || zipCode.replace(/\D/g, "").length !== 8) {
    return null;
  }

  return (
    <div className="mt-4 p-4 rounded-2xl bg-blue-50 border border-blue-200">
      <div className="flex items-center gap-2 mb-3">
        <Truck className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-blue-900">Frete e Entrega</h3>
      </div>

      {loading && (
        <div className="flex items-center gap-3">
          <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="text-sm text-blue-700">Calculando frete...</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-red-700 font-medium">Erro no cálculo</p>
            <p className="text-xs text-red-600">{error}</p>
          </div>
        </div>
      )}

      {shippingInfo && !loading && !error && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">Frete:</span>
            <span className="font-semibold text-blue-900">
              {shippingInfo.rateReais === 0
                ? "GRÁTIS"
                : `R$ ${shippingInfo.rateReais.toFixed(2)}`}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-blue-600">
            <MapPin className="w-3 h-3" />
            <span>
              {shippingInfo.distanceKm}km de {shippingInfo.origin.city}/
              {shippingInfo.origin.state}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-blue-600">
            <Clock className="w-3 h-3" />
            <span>
              Entrega em até {shippingInfo.estimatedDays}{" "}
              {shippingInfo.estimatedDays === 1 ? "dia útil" : "dias úteis"}
            </span>
          </div>

          {shippingInfo.rateReais === 0 && (
            <div className="mt-2 p-2 bg-green-100 border border-green-200 rounded-lg">
              <p className="text-xs text-green-700 font-medium">
                🎉 Frete grátis para sua região!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
