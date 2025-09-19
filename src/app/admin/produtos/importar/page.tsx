"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ImportarProdutosPage() {
  const { data: session, status } = useSession() || { data: null, status: 'unauthenticated' };
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    message: string;
    total: number;
    success: number;
    errors: number;
    results: Array<{
      success: boolean;
      error?: string;
      product?: { id: string; name: string; priceCents: number };
    }>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (status === "loading") {
    return <div className="p-4">Carregando...</div>;
  }

  if (!session) {
    router.push("/auth/login");
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/products/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao importar produtos");
      }

      setResult(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Erro ao importar produtos"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Importar Produtos</h1>
        <p className="text-muted-foreground">
          Importe produtos em lote através de um arquivo Excel
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-yellow-800 mb-2">Formato do Excel</h3>
        <p className="text-sm text-yellow-700 mb-2">
          O arquivo deve conter as seguintes colunas:
        </p>
        <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
          <li>
            <strong>Código:</strong> Código único do produto
          </li>
          <li>
            <strong>Descrição:</strong> Nome/descrição do produto
          </li>
          <li>
            <strong>Und:</strong> Unidade (UN, KG, etc.)
          </li>
          <li>
            <strong>Estoque:</strong> Quantidade em estoque
          </li>
          <li>
            <strong>Preço:</strong> Preço em reais (ex: 5,99)
          </li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="file">Arquivo Excel (.xlsx)</Label>
          <Input
            id="file"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            required
            className="mt-1"
          />
        </div>

        <Button type="submit" disabled={!file || loading} className="w-full">
          {loading ? "Importando..." : "Importar Produtos"}
        </Button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">
            Importação Concluída
          </h3>
          <div className="text-sm text-green-700 space-y-1">
            <p>
              <strong>Total de produtos:</strong> {result.total}
            </p>
            <p>
              <strong>Importados com sucesso:</strong> {result.success}
            </p>
            <p>
              <strong>Erros:</strong> {result.errors}
            </p>
          </div>

          {result.results && result.results.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-green-800 mb-2">
                Primeiros resultados:
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {result.results.map((r, index: number) => (
                  <div
                    key={index}
                    className={`text-xs p-2 rounded ${
                      r.success ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    {r.success ? (
                      <span className="text-green-700">
                        ✅ {r.product?.name} - R${" "}
                        {r.product?.priceCents
                          ? (r.product.priceCents / 100).toFixed(2)
                          : "0.00"}
                      </span>
                    ) : (
                      <span className="text-red-700">
                        ❌ {r.product?.name} - {r.error}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <Button variant="outline" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>
    </div>
  );
}
