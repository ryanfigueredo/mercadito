"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import PixPayment from "./PixPayment";
import CreditCardPayment from "./CreditCardPayment";
import DeliveryPayment from "./DeliveryPayment";
import CpfRegistration from "./CpfRegistration";
import type { PaymentData } from "@/types";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod: "pix" | "credit" | "delivery" | null;
  onSuccess: (data: PaymentData) => void;
  onError: (error: string) => void;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

export default function PaymentModal({
  isOpen,
  onClose,
  paymentMethod,
  onSuccess,
  onError,
  deliveryAddress,
}: PaymentModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showCpfRegistration, setShowCpfRegistration] = useState(false);
  const [cpfError, setCpfError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
      setShowCpfRegistration(false);
      setCpfError("");
    } else {
      document.body.style.overflow = "unset";
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handlePaymentError = (error: string) => {
    if (error.includes("CPF_REQUIRED")) {
      setShowCpfRegistration(true);
      setCpfError("CPF é obrigatório para este tipo de pagamento");
    } else {
      onError(error);
    }
  };

  const handleCpfRegistered = () => {
    setShowCpfRegistration(false);
    setCpfError("");
    // Recarregar a página para tentar o pagamento novamente
    window.location.reload();
  };

  const handleCpfCancel = () => {
    setShowCpfRegistration(false);
    setCpfError("");
    onClose();
  };

  if (!isVisible) return null;

  const getTitle = () => {
    switch (paymentMethod) {
      case "pix":
        return "Pagamento PIX";
      case "credit":
        return "Cartão de Crédito";
      case "delivery":
        return "Pagamento na Entrega";
      default:
        return "Pagamento";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? "opacity-50" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl transform transition-transform duration-300 ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "60vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{getTitle()}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[50vh] overflow-y-auto">
          {showCpfRegistration ? (
            <CpfRegistration
              onCpfRegistered={handleCpfRegistered}
              onCancel={handleCpfCancel}
            />
          ) : (
            <>
              {paymentMethod === "pix" && (
                <PixPayment
                  onSuccess={onSuccess}
                  onError={handlePaymentError}
                  deliveryAddress={deliveryAddress}
                />
              )}

              {paymentMethod === "credit" && (
                <CreditCardPayment
                  onSuccess={onSuccess}
                  onError={handlePaymentError}
                  deliveryAddress={deliveryAddress}
                />
              )}

              {paymentMethod === "delivery" && (
                <DeliveryPayment
                  onSuccess={onSuccess}
                  onError={onError}
                  deliveryAddress={deliveryAddress}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
