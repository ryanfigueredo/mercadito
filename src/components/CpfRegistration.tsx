"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CpfRegistrationProps {
  onCpfRegistered: (cpf: string) => void;
  onCancel: () => void;
}

export default function CpfRegistration({
  onCpfRegistered,
  onCancel,
}: CpfRegistrationProps) {
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const validateCPF = (cpf: string) => {
    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCpf)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.charAt(10))) return false;
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateCPF(cpf)) {
      setError("CPF inválido. Verifique os números digitados.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document: cpf.replace(/\D/g, ""),
        }),
      });

      if (response.ok) {
        onCpfRegistered(cpf.replace(/\D/g, ""));
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Erro ao cadastrar CPF");
      }
    } catch (error) {
      setError("Erro ao cadastrar CPF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Cadastrar CPF</h3>
        <p className="text-sm text-muted-foreground">
          CPF é obrigatório para pagamento. Cadastre agora para continuar.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="cpf" className="text-sm font-medium text-gray-700">
            CPF
          </Label>
          <Input
            id="cpf"
            value={cpf}
            onChange={(e) => setCpf(formatCPF(e.target.value))}
            className="mt-1"
            placeholder="000.000.000-00"
            maxLength={14}
            required
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading || !validateCPF(cpf)}
            className="flex-1 bg-[#F8B075] hover:bg-[#e69a66]"
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </div>
      </form>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-blue-700 text-xs">
          💡 <strong>Dica:</strong> Seu CPF será salvo no seu perfil para
          facilitar futuras compras.
        </p>
      </div>
    </div>
  );
}
