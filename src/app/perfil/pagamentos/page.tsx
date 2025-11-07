"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import SavedCardItem from "@/components/SavedCardItem";
import AddCardForm from "@/components/AddCardForm";
import { CreditCard, Plus, Shield } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface SavedCard {
  id: string;
  lastFour: string;
  brand: string;
  holderName: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export default function PagamentosPage() {
  const { data: session, status } = useSession();
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [useDeliveryForBilling, setUseDeliveryForBilling] = useState(true);
  const [billingLoaded, setBillingLoaded] = useState(false);
  const [savingBillingPreference, setSavingBillingPreference] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/login");
    }
    if (status === "authenticated") {
      fetchCards();
      fetchBillingPreference();
    }
  }, [status]);

  const fetchCards = async () => {
    try {
      const response = await fetch("/api/user/cards");
      if (response.ok) {
        const data = await response.json();
        setCards(data.cards || []);
      }
    } catch (error) {
      console.error("Erro ao buscar cartões:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBillingPreference = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setUseDeliveryForBilling(
          data.useDeliveryForBilling === undefined
            ? true
            : data.useDeliveryForBilling
        );
      }
    } catch (error) {
      console.error("Erro ao carregar preferência de faturamento:", error);
    } finally {
      setBillingLoaded(true);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      const response = await fetch(`/api/user/cards?cardId=${cardId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCards(cards.filter((card) => card.id !== cardId));
      } else {
        const error = await response.json();
        alert(error.error || "Erro ao remover cartão");
      }
    } catch (error) {
      console.error("Erro ao remover cartão:", error);
      alert("Erro ao remover cartão");
    }
  };

  const handleSetDefault = async (cardId: string) => {
    try {
      // Primeiro, remover padrão de todos os cartões
      await Promise.all(
        cards.map((card) =>
          fetch("/api/user/cards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...card,
              isDefault: false,
            }),
          })
        )
      );

      // Depois, definir o cartão selecionado como padrão
      const cardToUpdate = cards.find((card) => card.id === cardId);
      if (cardToUpdate) {
        const response = await fetch("/api/user/cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...cardToUpdate,
            isDefault: true,
          }),
        });

        if (response.ok) {
          fetchCards(); // Recarregar cartões
        }
      }
    } catch (error) {
      console.error("Erro ao definir cartão padrão:", error);
      alert("Erro ao definir cartão padrão");
    }
  };

  const handleCardAdded = () => {
    setShowAddForm(false);
    fetchCards();
  };

  const handleToggleBillingPreference = async () => {
    const nextValue = !useDeliveryForBilling;
    setUseDeliveryForBilling(nextValue);
    setSavingBillingPreference(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useDeliveryForBilling: nextValue }),
      });

      if (!response.ok) {
        throw new Error("Falha ao salvar preferência");
      }
    } catch (error) {
      console.error("Erro ao atualizar preferência de faturamento:", error);
      setUseDeliveryForBilling(!nextValue);
      alert("Não foi possível salvar a preferência. Tente novamente.");
    } finally {
      setSavingBillingPreference(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-dvh">
        <Topbar isLogged={false} />
        <main className="mx-auto max-w-sm px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F8B075]"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <Topbar isLogged={!!session} />
      <main className="mx-auto max-w-sm px-4 py-6">
        <div className="flex items-center justify-between mb-3">
          <h1 className="h-title">Métodos de Pagamento</h1>
          <Link href="/perfil" className="text-sm text-black font-semibold">
            Voltar
          </Link>
        </div>

        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={useDeliveryForBilling}
              onChange={handleToggleBillingPreference}
              aria-label="Usar endereço de entrega para faturamento"
              disabled={!billingLoaded || savingBillingPreference}
            />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-900">
                Usar endereço da entrega para faturamento
              </p>
              <p className="text-xs text-gray-500">
                Quando essa opção estiver ativa, seus pedidos utilizarão o
                endereço de entrega como referência para emissão de notas
                fiscais.
              </p>
              {!billingLoaded && (
                <p className="text-xs text-gray-400">Carregando preferência…</p>
              )}
              {savingBillingPreference && (
                <p className="text-xs text-gray-400">
                  Salvando preferência...
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Cartões Salvos */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Cartões Salvos</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center space-x-2 px-3 py-2 bg-[#F8B075] text-white rounded-lg text-sm font-medium hover:bg-[#F8B075]/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? "Fechar" : "Adicionar"}</span>
            </button>
          </div>

          {showAddForm ? (
            <AddCardForm
              onCardAdded={handleCardAdded}
              onCancel={() => setShowAddForm(false)}
              compact={cards.length > 0}
            />
          ) : cards.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">Nenhum cartão cadastrado</p>
              <p className="text-sm text-gray-400">
                Adicione um cartão para facilitar suas compras
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cards.map((card) => (
                <SavedCardItem
                  key={card.id}
                  card={card}
                  onDelete={handleDeleteCard}
                  onSetDefault={handleSetDefault}
                />
              ))}
            </div>
          )}
        </section>

        {/* Informações de Segurança */}
        <section className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Shield className="w-5 h-5 text-green-600 mt-0.5" />
            </div>
            <div>
              <h3 className="font-medium text-green-900 mb-1">
                Seus dados estão seguros
              </h3>
              <p className="text-sm text-green-700">
                Utilizamos criptografia SSL e não armazenamos dados sensíveis do
                cartão. Apenas os últimos 4 dígitos são salvos para
                identificação.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
