"use client";

import { useState } from "react";
import { CreditCard, Plus } from "lucide-react";

interface AddCardFormProps {
  onCardAdded: () => void;
  onCancel: () => void;
  compact?: boolean;
}

export default function AddCardForm({
  onCardAdded,
  onCancel,
  compact = false,
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

  const containerClasses = compact
    ? "p-3 border rounded-xl bg-white shadow-sm"
    : "p-4 border rounded-xl bg-gray-50";
  const sectionSpacing = compact ? "space-y-3" : "space-y-4";
  const inputPadding = compact ? "p-2.5" : "p-3";
  const buttonPadding = compact ? "py-2.5" : "py-3";
  const iconWrapperClass = `${compact ? "w-7 h-7" : "w-8 h-8"} bg-[#F8B075] rounded-lg flex items-center justify-center`;
  const gridGap = compact ? "gap-3" : "gap-4";

  return (
    <div className={containerClasses}>
      <div className="flex items-center space-x-2 mb-3">
        <div className={iconWrapperClass}>
          <Plus className={compact ? "w-3.5 h-3.5 text-white" : "w-4 h-4 text-white"} />
        </div>
        <h3 className="font-semibold text-gray-900 text-sm">
          Adicionar Cartão
        </h3>
      </div>

      <form onSubmit={handleSubmit} className={sectionSpacing}>
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
            className={`w-full ${inputPadding} border border-gray-300 rounded-lg text-sm`}
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
            className={`w-full ${inputPadding} border border-gray-300 rounded-lg text-sm`}
            required
          />
        </div>

        <div className={`grid grid-cols-2 ${gridGap}`}>
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
              className={`w-full ${inputPadding} border border-gray-300 rounded-lg text-sm`}
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
              className={`w-full ${inputPadding} border border-gray-300 rounded-lg text-sm`}
              required
            />
          </div>
        </div>

        <div className={`flex items-center space-x-2 ${compact ? "mt-1" : ""}`}>
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

        <div className={`flex space-x-3 ${compact ? "pt-1" : "pt-2"}`}>
          <button
            type="button"
            onClick={onCancel}
            className={`flex-1 px-4 ${buttonPadding} border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors`}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 px-4 ${buttonPadding} bg-[#F8B075] text-white font-medium rounded-lg hover:bg-[#F8B075]/90 disabled:opacity-50 transition-colors`}
          >
            {isSubmitting ? "Adicionando..." : "Adicionar Cartão"}
          </button>
        </div>
      </form>
    </div>
  );
}
