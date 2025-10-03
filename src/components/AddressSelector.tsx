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
  selectedAddress?: Address | null;
}

export default function AddressSelector({
  onAddressSelect,
  onAddressChange,
  selectedAddress,
}: AddressSelectorProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
  });

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

    try {
      const response = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      });

      if (response.ok) {
        const addedAddress = await response.json();
        setAddresses([...addresses, addedAddress]);
        onAddressSelect(addedAddress);
        setNewAddress({ street: "", city: "", state: "", zip: "" });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error("Erro ao adicionar endereço:", error);
    }
  };

  const formatZip = (zip: string) => {
    return zip.replace(/\D/g, "").replace(/(\d{5})(\d{3})/, "$1-$2");
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
              onClick={() => onAddressSelect(address)}
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
        <form
          onSubmit={handleAddAddress}
          className="space-y-4 p-4 border rounded-lg bg-gray-50"
        >
          <h4 className="font-medium text-gray-900">Novo Endereço</h4>

          <div>
            <Label htmlFor="street">Endereço</Label>
            <Input
              id="street"
              value={newAddress.street}
              onChange={(e) =>
                setNewAddress({ ...newAddress, street: e.target.value })
              }
              placeholder="Rua, número, complemento"
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
                placeholder="São Paulo"
                required
              />
            </div>
            <div>
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={newAddress.state}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, state: e.target.value })
                }
                placeholder="SP"
                maxLength={2}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="zip">CEP</Label>
            <Input
              id="zip"
              value={newAddress.zip}
              onChange={(e) =>
                setNewAddress({ ...newAddress, zip: formatZip(e.target.value) })
              }
              placeholder="00000-000"
              maxLength={9}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Salvar Endereço
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
      )}
    </div>
  );
}
