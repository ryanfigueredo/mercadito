"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Topbar from "@/components/Topbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function EditarPerfilPage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    useDeliveryForBilling: true,
  });

  useEffect(() => {
    if (session?.user?.email) {
      loadUserData();
    }
  }, [session]);

  const loadUserData = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setFormData({
          name: userData.name || "",
          useDeliveryForBilling:
            userData.useDeliveryForBilling === undefined
              ? true
              : userData.useDeliveryForBilling,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Perfil atualizado com sucesso!");
        loadUserData();
      } else {
        const error = await response.json();
        alert(error.error || "Erro ao atualizar perfil");
      }
    } catch (error) {
      alert("Erro ao atualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#F8B075] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-dvh">
        <Topbar isLogged={false} />
        <main className="mx-auto max-w-sm px-4 py-6">
          <p className="text-sm">Faça login para editar seu perfil.</p>
          <Link
            href="/auth/login"
            className="mt-2 inline-block font-semibold text-black"
          >
            Login
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gray-50">
      <Topbar isLogged={true} />
      <main className="mx-auto max-w-sm px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">Editar Perfil</h1>
          <Link href="/perfil" className="text-sm text-[#F8B075] font-semibold">
            Voltar
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Nome
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1"
                placeholder="Seu nome completo"
              />
              <p className="text-xs text-gray-500">
                Esse é o único dado pessoal que pode ser editado por aqui. Para
                alterar outros dados, fale com o suporte.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                E-mail
              </Label>
              <p className="text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                {user?.email ?? "-"}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Documento
              </Label>
              <p className="text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                {user?.document ?? "Informe-nos para emissão de nota fiscal"}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-4 space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-800">
                  Preferências de faturamento
                </p>
                <p className="text-xs text-gray-500">
                  Utilize o endereço informado na entrega para gerar notas
                  fiscais automaticamente.
                </p>
              </div>
              <label className="flex items-start gap-3">
                <Checkbox
                  checked={formData.useDeliveryForBilling}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      useDeliveryForBilling: e.target.checked,
                    })
                  }
                  aria-label="Usar endereço de entrega para faturamento"
                />
                <div className="space-y-1">
                  <span className="text-sm font-medium text-gray-700">
                    Usar endereço da entrega para faturamento
                  </span>
                  <p className="text-xs text-gray-500">
                    Se desmarcar, você poderá informar um endereço específico
                    durante o pagamento.
                  </p>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                href="/perfil/editar/senha"
                className="px-4 py-3 text-center text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Alterar Senha
              </Link>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-3 bg-[#F8B075] hover:bg-[#e69a66] text-white font-medium rounded-xl"
              >
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
