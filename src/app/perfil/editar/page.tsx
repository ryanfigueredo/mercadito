"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Topbar from "@/components/Topbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EditarPerfilPage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    document: "",
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
          phone: userData.phone ? formatPhone(userData.phone) : "+55",
          email: userData.email || "",
          document: userData.document || "",
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

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");

    // Se não começar com 55, adiciona automaticamente
    let phone = numbers;
    if (!phone.startsWith("55")) {
      phone = "55" + phone;
    }

    // Limita a 13 dígitos (55 + 11 dígitos do celular)
    phone = phone.substring(0, 13);

    // Formata: +55 (11) 99999-9999
    if (phone.length <= 2) {
      return "+55";
    } else if (phone.length <= 4) {
      return `+55 (${phone.substring(2)})`;
    } else if (phone.length <= 9) {
      return `+55 (${phone.substring(2, 4)}) ${phone.substring(4)}`;
    } else {
      return `+55 (${phone.substring(2, 4)}) ${phone.substring(
        4,
        9
      )}-${phone.substring(9)}`;
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
          <div className="space-y-4">
            <div>
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
            </div>

            <div>
              <Label
                htmlFor="phone"
                className="text-sm font-medium text-gray-700"
              >
                Telefone
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone: formatPhone(e.target.value),
                  })
                }
                className="mt-1"
                placeholder="+55 (11) 99999-9999"
              />
            </div>

            <div>
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="mt-1"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <Label
                htmlFor="document"
                className="text-sm font-medium text-gray-700"
              >
                CPF
              </Label>
              <Input
                id="document"
                value={formData.document}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    document: formatCPF(e.target.value),
                  })
                }
                className="mt-1"
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4">
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
