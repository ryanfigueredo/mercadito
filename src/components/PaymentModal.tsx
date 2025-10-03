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
  const [isProcessing, setIsProcessing] = useState(false);

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
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
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
        <div
          className="flex-1 overflow-y-auto p-4"
          style={{ maxHeight: "calc(90vh - 140px)" }}
        >
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
                  onProcessingChange={setIsProcessing}
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

        {/* Footer com botão Continuar e segurança */}
        <div className="flex-shrink-0 p-4 border-t border-gray-100 bg-gray-50">
          {/* Caixa de Segurança */}
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">
                  🔒 Site Seguro - Dados Protegidos
                </p>
                <p className="text-xs text-green-700">
                  Seus dados estão protegidos pela LGPD e criptografia SSL
                </p>
              </div>
            </div>
          </div>

          {/* Botão Continuar */}
          <Button
            onClick={() => {
              if (paymentMethod === "credit") {
                // Disparar o submit do formulário de cartão
                const form = document.querySelector("form");
                if (form) {
                  form.requestSubmit();
                }
              } else if (paymentMethod === "delivery") {
                // Disparar o submit do formulário de entrega
                const form = document.querySelector("form");
                if (form) {
                  form.requestSubmit();
                }
              }
              // PIX é processado automaticamente
            }}
            disabled={isProcessing || showCpfRegistration}
            className="w-full bg-[#F8B075] hover:bg-[#F8B075]/90 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processando..." : "Continuar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
