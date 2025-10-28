"use client";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  SearchIcon,
  ImageIcon,
  UploadIcon,
  PackageIcon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { getSecureImageUrl } from "@/lib/image-utils";
import { updateStockInAMC } from "@/lib/amc-integration";

type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  priceCents: number;
  stock: number;
  imageUrl?: string;
};

export default function EstoquePage() {
  const [q, setQ] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

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

  async function handleImageUpload(productId: string, file: File) {
    setUploadingImage(productId);

    try {
      // Upload para S3
      const formData = new FormData();
      formData.append("file", file);
      formData.append("productId", productId);

      const uploadRes = await fetch("/api/admin/products/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Erro no upload");
      }

      const { imageUrl } = await uploadRes.json();

      // Atualizar produto com nova imagem
      const updateRes = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });

      if (!updateRes.ok) {
        throw new Error("Erro ao atualizar produto");
      }

      // Recarregar produtos
      await loadProducts();
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao fazer upload da imagem");
    } finally {
      setUploadingImage(null);
    }
  }

  async function updateStock(productId: string, newStock: number) {
    if (newStock < 0) return;

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });

      if (res.ok) {
        // Atualizar estado local
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
        );

        // Enviar atualização para AMCSistema
        const product = products.find((p) => p.id === productId);
        if (product) {
          try {
            await updateStockInAMC(
              product.slug,
              newStock,
              "atualizacao_manual"
            );
            console.log(
              `✅ Estoque do produto ${product.slug} atualizado na AMC`
            );
          } catch (amcError) {
            console.error(`❌ Erro ao atualizar estoque na AMC:`, amcError);
            // Não falhar a operação por erro na AMC
          }
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar estoque:", error);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const list = useMemo(() => {
    if (!q) return products;
    const query = q.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.slug.toLowerCase().includes(query)
    );
  }, [products, q]);

  const lowStockProducts = products.filter((p) => p.stock <= 5);

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
            Controle de Estoque
          </h1>
          <p className="text-gray-600">
            {products.length} produtos cadastrados
          </p>
        </div>
        <Link href="/admin/produtos/importar">
          <Button className="bg-[#F8B075] hover:bg-[#e69a66] flex items-center gap-2">
            <UploadIcon size={16} />
            Importar XLSX
          </Button>
        </Link>
      </div>

      {/* Alerta de estoque baixo */}
      {lowStockProducts.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white">
              <AlertTriangle size={16} />
            </div>
            <div>
              <h3 className="font-semibold text-orange-900">
                {lowStockProducts.length} produtos com estoque baixo
              </h3>
              <p className="text-sm text-orange-700">
                Produtos com 5 ou menos unidades em estoque
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Busca */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            left={<SearchIcon />}
            placeholder="Buscar por nome, categoria ou código..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-12"
          />
        </div>
        <Link href="/admin/produtos/novo">
          <Button variant="outline" className="h-12 px-6">
            <PackageIcon size={16} className="mr-2" />
            Novo Produto
          </Button>
        </Link>
      </div>

      {/* Lista de produtos */}
      <div className="space-y-3">
        {list.length === 0 ? (
          <div className="text-center py-12">
            <PackageIcon size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {q ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
            </h3>
            <p className="text-gray-600 mb-6">
              {q
                ? "Tente buscar por outro termo"
                : "Importe produtos via XLSX ou cadastre manualmente"}
            </p>
            {!q && (
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
          list.map((product) => (
            <ProductStockCard
              key={product.id}
              product={product}
              onImageUpload={handleImageUpload}
              onStockUpdate={updateStock}
              isUploadingImage={uploadingImage === product.id}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ProductStockCard({
  product,
  onImageUpload,
  onStockUpdate,
  isUploadingImage,
}: {
  product: Product;
  onImageUpload: (productId: string, file: File) => void;
  onStockUpdate: (productId: string, stock: number) => void;
  isUploadingImage: boolean;
}) {
  const [editingStock, setEditingStock] = useState(false);
  const [stockValue, setStockValue] = useState(product.stock.toString());

  const handleStockSave = () => {
    const newStock = parseInt(stockValue);
    if (!isNaN(newStock) && newStock >= 0) {
      onStockUpdate(product.id, newStock);
      setEditingStock(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo e tamanho
      if (!file.type.startsWith("image/")) {
        alert("Por favor, selecione apenas arquivos de imagem");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB
        alert("Imagem muito grande. Máximo 5MB");
        return;
      }
      onImageUpload(product.id, file);
    }
  };

  const stockStatus =
    product.stock <= 0 ? "out" : product.stock <= 5 ? "low" : "ok";

  return (
    <div className="bg-white rounded-2xl border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        {/* Imagem do produto */}
        <div className="relative w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
          {product.imageUrl ? (
            <img
              src={getSecureImageUrl(product.imageUrl)}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/api/images/placeholder";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon size={24} className="text-gray-400" />
            </div>
          )}

          {/* Upload overlay */}
          <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={isUploadingImage}
            />
            {isUploadingImage ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <UploadIcon size={16} className="text-white" />
            )}
          </label>
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
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Código: {product.slug}
              </p>
            </div>

            {/* Controle de estoque */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-gray-500">Estoque</p>
                {editingStock ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      value={stockValue}
                      onChange={(e) => setStockValue(e.target.value)}
                      className="w-16 px-2 py-1 text-sm border rounded"
                      autoFocus
                    />
                    <button
                      onClick={handleStockSave}
                      className="text-green-600 hover:text-green-700 text-xs"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingStock(false);
                        setStockValue(product.stock.toString());
                      }}
                      className="text-red-600 hover:text-red-700 text-xs"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingStock(true)}
                    className={`font-semibold text-sm px-2 py-1 rounded-full ${
                      stockStatus === "out"
                        ? "bg-red-100 text-red-800"
                        : stockStatus === "low"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {product.stock} un
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
