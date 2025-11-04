"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Truck, Save, Plus, Trash2 } from "lucide-react";

interface ShippingRate {
  maxDistance: number;
  rate: number;
}

interface StoreConfig {
  lat: number;
  lng: number;
  city: string;
  state: string;
  address?: string;
  zipCode?: string;
}

export default function FreteConfigPage() {
  const [storeConfig, setStoreConfig] = useState<StoreConfig>({
    lat: -12.2387,
    lng: -38.9753,
    city: "Feira de Santana",
    state: "BA",
  });

  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([
    { maxDistance: 5, rate: 0 },
    { maxDistance: 10, rate: 800 },
    { maxDistance: 20, rate: 1200 },
    { maxDistance: 50, rate: 2000 },
    { maxDistance: 100, rate: 3500 },
    { maxDistance: 200, rate: 5000 },
    { maxDistance: 999999, rate: 8000 },
  ]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar configuração ao montar o componente
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/shipping-config");
      if (response.ok) {
        const config = await response.json();
        setStoreConfig({
          lat: config.storeLat || -12.2387,
          lng: config.storeLng || -38.9753,
          city: config.storeCity || "Feira de Santana",
          state: config.storeState || "BA",
          address: config.storeAddress,
          zipCode: config.storeZipCode,
        });
        if (config.shippingRates && Array.isArray(config.shippingRates)) {
          setShippingRates(config.shippingRates);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar configuração:", err);
      setError("Erro ao carregar configuração");
    } finally {
      setLoading(false);
    }
  };

  const addShippingRate = () => {
    setShippingRates([...shippingRates, { maxDistance: 0, rate: 0 }]);
  };

  const removeShippingRate = (index: number) => {
    if (shippingRates.length > 1) {
      setShippingRates(shippingRates.filter((_, i) => i !== index));
    }
  };

  const updateShippingRate = (
    index: number,
    field: keyof ShippingRate,
    value: number
  ) => {
    const updated = [...shippingRates];
    updated[index] = { ...updated[index], [field]: value };
    setShippingRates(updated);
  };

  const formatCurrency = (cents: number) => {
    return `R$ ${(cents / 100).toFixed(2)}`;
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/shipping-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeLat: storeConfig.lat,
          storeLng: storeConfig.lng,
          storeCity: storeConfig.city,
          storeState: storeConfig.state,
          storeAddress: storeConfig.address,
          storeZipCode: storeConfig.zipCode,
          shippingRates: shippingRates,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao salvar");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Erro ao salvar configurações:", err);
      setError(
        err instanceof Error ? err.message : "Erro ao salvar configurações"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Truck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Configuração de Frete
            </h1>
            <p className="text-gray-600">
              Configure as regras de cálculo de frete por distância
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Configuração da Loja */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Localização da Loja
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="storeLat">Latitude</Label>
                <Input
                  id="storeLat"
                  type="number"
                  step="0.0001"
                  value={storeConfig.lat}
                  onChange={(e) =>
                    setStoreConfig({
                      ...storeConfig,
                      lat: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="storeLng">Longitude</Label>
                <Input
                  id="storeLng"
                  type="number"
                  step="0.0001"
                  value={storeConfig.lng}
                  onChange={(e) =>
                    setStoreConfig({
                      ...storeConfig,
                      lng: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="storeCity">Cidade</Label>
                <Input
                  id="storeCity"
                  value={storeConfig.city}
                  onChange={(e) =>
                    setStoreConfig({ ...storeConfig, city: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="storeState">Estado</Label>
                <Input
                  id="storeState"
                  value={storeConfig.state}
                  onChange={(e) =>
                    setStoreConfig({ ...storeConfig, state: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="storeAddress">Endereço (opcional)</Label>
                <Input
                  id="storeAddress"
                  value={storeConfig.address || ""}
                  onChange={(e) =>
                    setStoreConfig({ ...storeConfig, address: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="storeZipCode">CEP (opcional)</Label>
                <Input
                  id="storeZipCode"
                  value={storeConfig.zipCode || ""}
                  onChange={(e) =>
                    setStoreConfig({ ...storeConfig, zipCode: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Frete */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                Tabela de Frete por Distância
              </span>
              <Button
                onClick={addShippingRate}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shippingRates.map((rate, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50"
                >
                  <div className="flex-1">
                    <Label htmlFor={`distance-${index}`}>
                      {index === shippingRates.length - 1 ? "Acima de" : "Até"}{" "}
                      (km)
                    </Label>
                    <Input
                      id={`distance-${index}`}
                      type="number"
                      value={
                        rate.maxDistance === 999999 ? "" : rate.maxDistance
                      }
                      placeholder={
                        index === shippingRates.length - 1
                          ? "Qualquer distância"
                          : "Ex: 10"
                      }
                      onChange={(e) => {
                        const value =
                          e.target.value === ""
                            ? 999999
                            : parseInt(e.target.value);
                        updateShippingRate(index, "maxDistance", value);
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`rate-${index}`}>
                      Valor do Frete (centavos)
                    </Label>
                    <Input
                      id={`rate-${index}`}
                      type="number"
                      value={rate.rate}
                      onChange={(e) =>
                        updateShippingRate(
                          index,
                          "rate",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-gray-600 min-w-[100px]">
                      {formatCurrency(rate.rate)}
                    </div>
                    {shippingRates.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeShippingRate(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Preview da Tabela */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3">
                Preview da Tabela
              </h3>
              <div className="space-y-2">
                {shippingRates.map((rate, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {index === 0
                        ? `0km - ${rate.maxDistance}km`
                        : index === shippingRates.length - 1
                        ? `Acima de ${shippingRates[index - 1].maxDistance}km`
                        : `${shippingRates[index - 1].maxDistance + 1}km - ${
                            rate.maxDistance
                          }km`}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(rate.rate)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <Card>
          <CardHeader>
            <CardTitle>Como Funciona</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <p>
              <strong>1. Validação de CEP:</strong> O sistema usa a API do
              ViaCEP para validar e obter dados do CEP informado.
            </p>
            <p>
              <strong>2. Cálculo de Distância:</strong> Utiliza a fórmula de
              Haversine para calcular a distância entre a loja e o endereço de
              entrega.
            </p>
            <p>
              <strong>3. Aplicação da Tabela:</strong> O frete é calculado
              baseado na faixa de distância correspondente na tabela acima.
            </p>
            <p>
              <strong>4. Prazo de Entrega:</strong> Calculado automaticamente
              baseado na distância:
            </p>
            <ul className="ml-4 space-y-1">
              <li>• Até 50km: 1 dia útil</li>
              <li>• 51km a 100km: 2 dias úteis</li>
              <li>• Acima de 100km: 3 dias úteis</li>
            </ul>
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            {saving
              ? "Salvando..."
              : saved
              ? "Salvo!"
              : "Salvar Configurações"}
          </Button>
        </div>
      </div>
    </div>
  );
}
