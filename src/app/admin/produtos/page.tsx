"use client";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  SearchIcon,
  PackageIcon,
  UploadIcon,
  PencilIcon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  priceCents: number;
  stock: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export default function ProdutosPage() {
  const [q, setQ] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "low-stock" | "no-image">("all");

  async function loadProducts() {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(productId: string) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await loadProducts(); // Recarregar lista
      } else {
        const error = await res.json();
        alert(error.error || "Erro ao excluir produto");
      }
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      alert("Erro ao excluir produto");
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Aplicar filtro de categoria
    if (filter === "low-stock") {
      filtered = filtered.filter((p) => p.stock <= 5);
    } else if (filter === "no-image") {
      filtered = filtered.filter((p) => !p.imageUrl);
    }

    // Aplicar busca
    if (q) {
      const query = q.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.slug.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [products, q, filter]);

  const stats = {
    total: products.length,
    lowStock: products.filter((p) => p.stock <= 5).length,
    noImage: products.filter((p) => !p.imageUrl).length,
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#F8B075] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-500">Carregando produtos...</p>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gerenciar Produtos
          </h1>
          <p className="text-gray-600">{stats.total} produtos cadastrados</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/produtos/importar">
            <Button variant="outline" className="flex items-center gap-2">
              <UploadIcon size={16} />
              Importar XLSX
            </Button>
          </Link>
          <Link href="/admin/produtos/novo">
            <Button className="bg-[#F8B075] hover:bg-[#e69a66] flex items-center gap-2">
              <PackageIcon size={16} />
              Novo Produto
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white">
              <PackageIcon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total de Produtos</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white">
              ⚠️
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.lowStock}
              </p>
              <p className="text-sm text-gray-600">Estoque Baixo</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-white">
              📷
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.noImage}
              </p>
              <p className="text-sm text-gray-600">Sem Imagem</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex gap-3 items-center">
        <div className="flex-1">
          <Input
            left={<SearchIcon />}
            placeholder="Buscar por nome, categoria ou código..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-12"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className="h-12"
          >
            Todos ({stats.total})
          </Button>
          <Button
            variant={filter === "low-stock" ? "default" : "outline"}
            onClick={() => setFilter("low-stock")}
            className="h-12"
          >
            Estoque Baixo ({stats.lowStock})
          </Button>
          <Button
            variant={filter === "no-image" ? "default" : "outline"}
            onClick={() => setFilter("no-image")}
            className="h-12"
          >
            Sem Imagem ({stats.noImage})
          </Button>
        </div>
      </div>

      {/* Lista de produtos */}
      <div className="space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <PackageIcon size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {q
                ? "Nenhum produto encontrado"
                : filter === "all"
                ? "Nenhum produto cadastrado"
                : filter === "low-stock"
                ? "Nenhum produto com estoque baixo"
                : "Todos os produtos têm imagem"}
            </h3>
            <p className="text-gray-600 mb-6">
              {q
                ? "Tente buscar por outro termo"
                : filter === "all"
                ? "Importe produtos via XLSX ou cadastre manualmente"
                : "Que ótimo! Todos os produtos estão bem configurados."}
            </p>
            {!q && filter === "all" && (
              <div className="flex gap-3 justify-center">
                <Link href="/admin/produtos/importar">
                  <Button className="bg-[#F8B075] hover:bg-[#e69a66]">
                    <UploadIcon size={16} className="mr-2" />
                    Importar XLSX
                  </Button>
                </Link>
                <Link href="/admin/produtos/novo">
                  <Button variant="outline">
                    <PackageIcon size={16} className="mr-2" />
                    Novo Produto
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={deleteProduct}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ProductCard({
  product,
  onDelete,
}: {
  product: Product;
  onDelete: (id: string) => void;
}) {
  const stockStatus =
    product.stock <= 0 ? "out" : product.stock <= 5 ? "low" : "ok";

  return (
    <div className="bg-white rounded-2xl border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        {/* Imagem do produto */}
        <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PackageIcon size={24} className="text-gray-400" />
            </div>
          )}
        </div>

        {/* Info do produto */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {product.name}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-500">
                  {product.category}
                </span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm font-medium text-gray-900">
                  R$ {(product.priceCents / 100).toFixed(2)}
                </span>
                <span className="text-sm text-gray-400">•</span>
                <span
                  className={`text-sm px-2 py-1 rounded-full ${
                    stockStatus === "out"
                      ? "bg-red-100 text-red-800"
                      : stockStatus === "low"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {product.stock} un
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Código: {product.slug}
              </p>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-2 ml-4">
              <Link href={`/admin/produtos/editar/${product.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-[#F8B075] hover:text-white hover:border-[#F8B075]"
                >
                  <PencilIcon size={14} className="mr-1" />
                  Editar
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(product.id)}
                className="text-red-600 hover:text-red-700 hover:border-red-300"
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
