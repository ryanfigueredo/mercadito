"use client";

import { useState } from "react";
import { CreditCard, Trash2, Star } from "lucide-react";

interface SavedCard {
  id: string;
  lastFour: string;
  brand: string;
  holderName: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface SavedCardItemProps {
  card: SavedCard;
  onDelete: (cardId: string) => void;
  onSetDefault: (cardId: string) => void;
}

export default function SavedCardItem({
  card,
  onDelete,
  onSetDefault,
}: SavedCardItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const getBrandIcon = (brand: string) => {
    const brandLower = brand.toLowerCase();
    if (brandLower.includes("visa")) return "💳";
    if (brandLower.includes("mastercard")) return "💳";
    if (brandLower.includes("amex")) return "💳";
    return "💳";
  };

  const formatExpiration = (month: number, year: number) => {
    const monthStr = month.toString().padStart(2, "0");
    const yearStr = year.toString().slice(-2);
    return `${monthStr}/${yearStr}`;
  };

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja remover este cartão?")) {
      setIsDeleting(true);
      try {
        await onDelete(card.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-xl bg-white">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getBrandIcon(card.brand)}</span>
            <span className="font-medium text-gray-900">
              {card.brand} •••• {card.lastFour}
            </span>
            {card.isDefault && (
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-xs text-yellow-600 font-medium">
                  Padrão
                </span>
              </div>
            )}
          </div>

          <div className="mt-1 text-sm text-gray-600">
            <p>{card.holderName}</p>
            <p>Expira em {formatExpiration(card.expMonth, card.expYear)}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {!card.isDefault && (
          <button
            onClick={() => onSetDefault(card.id)}
            className="p-2 text-gray-400 hover:text-yellow-500 transition-colors"
            title="Definir como padrão"
          >
            <Star className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
          title="Remover cartão"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
