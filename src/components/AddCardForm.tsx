"use client";

import { useState } from "react";
import { CreditCard, Plus } from "lucide-react";

interface AddCardFormProps {
  onCardAdded: () => void;
  onCancel: () => void;
}

export default function AddCardForm({
  onCardAdded,
  onCancel,
}: AddCardFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: "",
    holderName: "",
    expMonth: "",
    expYear: "",
    cvv: "",
    isDefault: false,
  });

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(" ").substring(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiration = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + "/" + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const getCardBrand = (number: string) => {
    const cleaned = number.replace(/\s/g, "");
    if (cleaned.startsWith("4")) return "Visa";
    if (cleaned.startsWith("5") || cleaned.startsWith("2")) return "Mastercard";
    if (cleaned.startsWith("3")) return "American Express";
    return "Cartão";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const cardNumber = formData.cardNumber.replace(/\s/g, "");
      const lastFour = cardNumber.slice(-4);
      const brand = getCardBrand(cardNumber);

      const response = await fetch("/api/user/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastFour,
          brand,
          holderName: formData.holderName,
          expMonth: parseInt(formData.expMonth),
          expYear: parseInt(formData.expYear),
          isDefault: formData.isDefault,
        }),
      });

      if (response.ok) {
        onCardAdded();
        setFormData({
          cardNumber: "",
          holderName: "",
          expMonth: "",
          expYear: "",
          cvv: "",
          isDefault: false,
        });
      } else {
        const error = await response.json();
        alert(error.error || "Erro ao adicionar cartão");
      }
    } catch (error) {
      console.error("Erro ao adicionar cartão:", error);
      alert("Erro ao adicionar cartão");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 border rounded-xl bg-gray-50">
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-8 h-8 bg-[#F8B075] rounded-lg flex items-center justify-center">
          <Plus className="w-4 h-4 text-white" />
        </div>
        <h3 className="font-semibold text-gray-900">Adicionar Cartão</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número do Cartão
          </label>
          <input
            type="text"
            value={formData.cardNumber}
            onChange={(e) =>
              setFormData({
                ...formData,
                cardNumber: formatCardNumber(e.target.value),
              })
            }
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome no Cartão
          </label>
          <input
            type="text"
            value={formData.holderName}
            onChange={(e) =>
              setFormData({
                ...formData,
                holderName: e.target.value.toUpperCase(),
              })
            }
            placeholder="NOME COMO NO CARTÃO"
            className="w-full p-3 border border-gray-300 rounded-lg text-sm"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Validade (MM/AA)
            </label>
            <input
              type="text"
              value={
                formData.expMonth && formData.expYear
                  ? formatExpiration(formData.expMonth + formData.expYear)
                  : ""
              }
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\D/g, "");
                const [month, year] = cleaned.split("/");
                setFormData({
                  ...formData,
                  expMonth: month || "",
                  expYear: year || "",
                });
              }}
              placeholder="MM/AA"
              maxLength={5}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVV
            </label>
            <input
              type="text"
              value={formData.cvv}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  cvv: e.target.value.replace(/\D/g, "").substring(0, 3),
                })
              }
              placeholder="123"
              maxLength={3}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
              required
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isDefault"
            checked={formData.isDefault}
            onChange={(e) =>
              setFormData({ ...formData, isDefault: e.target.checked })
            }
            className="h-4 w-4 text-[#F8B075] border-gray-300 rounded"
          />
          <label htmlFor="isDefault" className="text-sm text-gray-700">
            Definir como cartão padrão
          </label>
        </div>

        <div className="flex space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-[#F8B075] text-white font-medium rounded-lg hover:bg-[#F8B075]/90 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Adicionando..." : "Adicionar Cartão"}
          </button>
        </div>
      </form>
    </div>
  );
}
