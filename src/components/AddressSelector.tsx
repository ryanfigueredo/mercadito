"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckIcon, PlusIcon } from "@/components/ui/icons";

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  isDefault?: boolean;
}

interface AddressSelectorProps {
  onAddressSelect: (address: Address) => void;
  onAddressChange: () => void;
  onShippingCalculate?: (address: Address) => void;
  selectedAddress?: Address | null;
}

export default function AddressSelector({
  onAddressSelect,
  onAddressChange,
  onShippingCalculate,
  selectedAddress,
}: AddressSelectorProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "Minha Casa",
    street: "",
    city: "",
    state: "",
    zip: "",
  });
  const [loadingCep, setLoadingCep] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/user/addresses");
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);

        // Selecionar o endereço padrão automaticamente
        const defaultAddress = data.find((addr: Address) => addr.isDefault);
        if (defaultAddress) {
          onAddressSelect(defaultAddress);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar endereços:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("📝 Enviando endereço:", newAddress);

    try {
      const response = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      });

      console.log("📡 Resposta da API:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Erro da API:", errorData);
        alert(
          `Erro ao salvar endereço: ${errorData.error || "Erro desconhecido"}`
        );
        return;
      }

      if (response.ok) {
        const addedAddress = await response.json();
        setAddresses([...addresses, addedAddress]);
        onAddressSelect(addedAddress);
        // Calcular frete automaticamente para o novo endereço
        if (onShippingCalculate) {
          onShippingCalculate(addedAddress);
        }
        setNewAddress({
          label: "Minha Casa",
          street: "",
          city: "",
          state: "",
          zip: "",
        });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error("Erro ao adicionar endereço:", error);
    }
  };

  const formatZip = (zip: string) => {
    return zip.replace(/\D/g, "").replace(/(\d{5})(\d{3})/, "$1-$2");
  };

  const fetchCepData = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    setLoadingCep(true);
    try {
      const response = await fetch(
        `/api/shipping/calculate?zipCode=${cleanCep}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.address) {
          setNewAddress({
            ...newAddress,
            street: data.address.street || "",
            city: data.address.city || "",
            state: data.address.state || "",
            zip: cep,
          });
        }
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setLoadingCep(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F8B075] mx-auto"></div>
        <p className="mt-2 text-gray-600">Carregando endereços...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Endereço de Cobrança
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddressChange}
          className="text-[#F8B075] border-[#F8B075] hover:bg-[#F8B075] hover:text-white"
        >
          Alterar
        </Button>
      </div>

      {addresses.length > 0 && !showAddForm && (
        <div className="space-y-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedAddress?.id === address.id
                  ? "border-[#F8B075] bg-orange-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => {
                onAddressSelect(address);
                // Calcular frete automaticamente quando endereço é selecionado
                if (onShippingCalculate) {
                  onShippingCalculate(address);
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{address.street}</p>
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.state} - {formatZip(address.zip)}
                  </p>
                  {address.isDefault && (
                    <span className="inline-block mt-1 px-2 py-1 text-xs bg-[#F8B075] text-white rounded">
                      Padrão
                    </span>
                  )}
                </div>
                {selectedAddress?.id === address.id && (
                  <CheckIcon className="w-5 h-5 text-[#F8B075]" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!showAddForm && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowAddForm(true)}
          className="w-full border-dashed border-gray-300 text-gray-600 hover:border-[#F8B075] hover:text-[#F8B075]"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Adicionar Novo Endereço
        </Button>
      )}

      {showAddForm && (
        <div className="max-h-64 overflow-y-auto">
          <form
            onSubmit={handleAddAddress}
            className="space-y-4 p-4 border rounded-lg bg-gray-50"
          >
            <h4 className="font-medium text-gray-900">Novo Endereço</h4>

            <div>
              <Label htmlFor="label">Nome do Endereço</Label>
              <Input
                id="label"
                value={newAddress.label}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, label: e.target.value })
                }
                placeholder="Ex: Casa, Trabalho, etc."
                required
              />
            </div>

            <div>
              <Label htmlFor="street">Endereço</Label>
              <Input
                id="street"
                value={newAddress.street}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, street: e.target.value })
                }
                placeholder="Digite o endereço"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={newAddress.city}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, city: e.target.value })
                  }
                  placeholder="Digite a cidade"
                  required
                />
              </div>
              <div>
                <Label htmlFor="state">UF</Label>
                <Input
                  id="state"
                  value={newAddress.state}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, state: e.target.value })
                  }
                  placeholder="Ex: SP"
                  maxLength={2}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="zip">CEP</Label>
              <div className="relative">
                <Input
                  id="zip"
                  value={newAddress.zip}
                  onChange={(e) => {
                    const formattedZip = formatZip(e.target.value);
                    setNewAddress({
                      ...newAddress,
                      zip: formattedZip,
                    });
                    // Buscar dados do CEP automaticamente
                    if (formattedZip.replace(/\D/g, "").length === 8) {
                      fetchCepData(formattedZip);
                    }
                  }}
                  placeholder="00000-000"
                  maxLength={9}
                  required
                />
                {loadingCep && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin w-4 h-4 border-2 border-[#F8B075] border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Botão de Confirmar Endereço - aparece quando todos os campos estão preenchidos */}
            {newAddress.street &&
              newAddress.city &&
              newAddress.state &&
              newAddress.zip && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700 mb-3">
                    ✅ Endereço preenchido automaticamente pelo CEP. Confirme
                    para continuar:
                  </p>
                  <div className="text-sm text-blue-600 mb-2">
                    <strong>{newAddress.street}</strong>
                    <br />
                    {newAddress.city}, {newAddress.state} - {newAddress.zip}
                  </div>
                </div>
              )}

            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1 bg-[#F8B075] hover:bg-[#e69a66]"
              >
                {newAddress.street &&
                newAddress.city &&
                newAddress.state &&
                newAddress.zip
                  ? "Confirmar e Salvar Endereço"
                  : "Salvar Endereço"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
