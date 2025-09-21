"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPinIcon, PlusIcon, CheckIcon } from "@/components/ui/icons";

export type Address = {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
};

interface AddressSelectorProps {
  userAddresses: Address[];
  selectedAddress: Address | null;
  onAddressSelect: (address: Address) => void;
  onAddressCreate: (address: Omit<Address, "id">) => Promise<void>;
}

export default function AddressSelector({
  userAddresses,
  selectedAddress,
  onAddressSelect,
  onAddressCreate,
}: AddressSelectorProps) {
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "Casa",
    street: "",
    city: "",
    state: "",
    zip: "",
  });

  // Auto-select first address if none selected
  useEffect(() => {
    if (!selectedAddress && userAddresses.length > 0) {
      onAddressSelect(userAddresses[0]);
    }
  }, [userAddresses, selectedAddress, onAddressSelect]);

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newAddress.street ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.zip
    ) {
      return;
    }

    setLoading(true);
    try {
      await onAddressCreate(newAddress);
      setNewAddress({
        label: "Casa",
        street: "",
        city: "",
        state: "",
        zip: "",
      });
      setShowNewAddressForm(false);
    } catch (error) {
      console.error("Erro ao criar endereço:", error);
    } finally {
      setLoading(false);
    }
  };

  if (userAddresses.length === 0 && !showNewAddressForm) {
    return (
      <div className="bg-white rounded-2xl border p-4">
        <div className="flex items-center gap-3 mb-4">
          <MapPinIcon size={20} className="text-[#F8B075]" />
          <h3 className="font-semibold text-gray-900">Endereço de Entrega</h3>
        </div>

        <div className="text-center py-6">
          <MapPinIcon size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600 mb-4">
            Você ainda não tem endereços cadastrados
          </p>
          <Button
            onClick={() => setShowNewAddressForm(true)}
            className="bg-[#F8B075] hover:bg-[#e69a66]"
          >
            <PlusIcon size={16} className="mr-2" />
            Adicionar Endereço
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <MapPinIcon size={20} className="text-[#F8B075]" />
          <h3 className="font-semibold text-gray-900">Endereço de Entrega</h3>
        </div>
        {userAddresses.length > 0 && !showNewAddressForm && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNewAddressForm(true)}
          >
            <PlusIcon size={14} className="mr-1" />
            Novo
          </Button>
        )}
      </div>

      {/* Lista de endereços existentes */}
      {!showNewAddressForm && userAddresses.length > 0 && (
        <div className="space-y-2">
          {userAddresses.map((address) => (
            <button
              key={address.id}
              onClick={() => onAddressSelect(address)}
              className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                selectedAddress?.id === address.id
                  ? "border-[#F8B075] bg-orange-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {address.label}
                    </span>
                    {selectedAddress?.id === address.id && (
                      <CheckIcon size={16} className="text-[#F8B075]" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {address.street}
                  </p>
                  <p className="text-sm text-gray-500">
                    {address.city} - {address.state}, {address.zip}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Formulário para novo endereço */}
      {showNewAddressForm && (
        <form onSubmit={handleCreateAddress} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="label" className="text-sm font-medium">
                Identificação
              </Label>
              <select
                id="label"
                value={newAddress.label}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, label: e.target.value })
                }
                className="w-full mt-1 p-2 border rounded-lg text-sm"
                required
              >
                <option value="Casa">Casa</option>
                <option value="Trabalho">Trabalho</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
            <div>
              <Label htmlFor="zip" className="text-sm font-medium">
                CEP
              </Label>
              <Input
                id="zip"
                type="text"
                placeholder="00000-000"
                value={newAddress.zip}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, zip: e.target.value })
                }
                className="mt-1"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="street" className="text-sm font-medium">
              Endereço completo
            </Label>
            <Input
              id="street"
              type="text"
              placeholder="Rua, número, complemento"
              value={newAddress.street}
              onChange={(e) =>
                setNewAddress({ ...newAddress, street: e.target.value })
              }
              className="mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="city" className="text-sm font-medium">
                Cidade
              </Label>
              <Input
                id="city"
                type="text"
                placeholder="Cidade"
                value={newAddress.city}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, city: e.target.value })
                }
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="state" className="text-sm font-medium">
                Estado
              </Label>
              <Input
                id="state"
                type="text"
                placeholder="UF"
                maxLength={2}
                value={newAddress.state}
                onChange={(e) =>
                  setNewAddress({
                    ...newAddress,
                    state: e.target.value.toUpperCase(),
                  })
                }
                className="mt-1"
                required
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowNewAddressForm(false);
                setNewAddress({
                  label: "Casa",
                  street: "",
                  city: "",
                  state: "",
                  zip: "",
                });
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#F8B075] hover:bg-[#e69a66]"
            >
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
