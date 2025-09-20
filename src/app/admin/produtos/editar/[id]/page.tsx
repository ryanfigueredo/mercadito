"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  PackageIcon,
  ImageIcon,
  UploadIcon,
  ArrowLeftIcon,
} from "@/components/ui/icons";
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
  promoText?: string;
};

const categories = [
  "Grãos",
  "Bebidas",
  "Padaria",
  "Limpeza",
  "Hortifruti",
  "Diversos",
];

export default function EditarProdutoPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "Diversos",
    price: "",
    stock: "",
    promoText: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  async function loadProduct() {
    try {
      const res = await fetch(`/api/admin/products`);
      const products = await res.json();
      const foundProduct = products.find((p: Product) => p.id === params.id);

      if (!foundProduct) {
        router.push("/admin/produtos");
        return;
      }

      setProduct(foundProduct);
      setFormData({
        name: foundProduct.name,
        category: foundProduct.category,
        price: (foundProduct.priceCents / 100).toString(),
        stock: foundProduct.stock.toString(),
        promoText: foundProduct.promoText || "",
      });
    } catch (error) {
      console.error("Erro ao carregar produto:", error);
      router.push("/admin/produtos");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validações
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Preço deve ser maior que zero";
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = "Estoque não pode ser negativo";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/admin/products/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          category: formData.category,
          priceCents: Math.round(parseFloat(formData.price) * 100),
          stock: parseInt(formData.stock),
          promoText: formData.promoText.trim() || null,
        }),
      });

      if (res.ok) {
        router.push("/admin/produtos");
      } else {
        const error = await res.json();
        alert(error.error || "Erro ao salvar produto");
      }
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      alert("Erro ao salvar produto");
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(file: File) {
    setUploadingImage(true);

    try {
      // Upload para S3
      const formData = new FormData();
      formData.append("file", file);
      formData.append("productId", params.id);

      const uploadRes = await fetch("/api/admin/products/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Erro no upload");
      }

      const { imageUrl } = await uploadRes.json();

      // Atualizar produto com nova imagem
      const updateRes = await fetch(`/api/admin/products/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });

      if (updateRes.ok) {
        // Atualizar estado local
        setProduct((prev) => (prev ? { ...prev, imageUrl } : null));
      } else {
        throw new Error("Erro ao atualizar produto");
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao fazer upload da imagem");
    } finally {
      setUploadingImage(false);
    }
  }

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
      handleImageUpload(file);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#F8B075] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-500">Carregando produto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-8 text-center">
        <PackageIcon size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Produto não encontrado
        </h3>
        <Link href="/admin/produtos">
          <Button>Voltar para Produtos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/produtos">
          <Button variant="outline" size="sm">
            <ArrowLeftIcon size={16} className="mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Produto</h1>
          <p className="text-gray-600">Código: {product.slug}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Imagem do produto */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Imagem do Produto</h2>

            <div className="relative aspect-square rounded-xl bg-gray-100 overflow-hidden mb-4">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={48} className="text-gray-400" />
                </div>
              )}

              {/* Upload overlay */}
              <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={uploadingImage}
                />
                {uploadingImage ? (
                  <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <div className="text-center text-white">
                    <UploadIcon size={24} className="mx-auto mb-2" />
                    <p className="text-sm">Alterar Imagem</p>
                  </div>
                )}
              </label>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Clique na imagem para alterar
              <br />
              Máximo 5MB • JPG, PNG, WebP
            </p>
          </div>
        </div>

        {/* Formulário */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border p-6 space-y-6"
          >
            <h2 className="text-lg font-semibold">Informações do Produto</h2>

            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Produto *
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Arroz Camil 5kg"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F8B075] focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Preço e Estoque */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço (R$) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="0,00"
                  className={errors.price ? "border-red-500" : ""}
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estoque *
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  placeholder="0"
                  className={errors.stock ? "border-red-500" : ""}
                />
                {errors.stock && (
                  <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
                )}
              </div>
            </div>

            {/* Texto promocional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texto Promocional (Opcional)
              </label>
              <Input
                value={formData.promoText}
                onChange={(e) =>
                  setFormData({ ...formData, promoText: e.target.value })
                }
                placeholder="Ex: Oferta especial, Produto em destaque..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Aparecerá como badge no produto
              </p>
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Link href="/admin/produtos" className="flex-1">
                <Button variant="outline" className="w-full" type="button">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[#F8B075] hover:bg-[#e69a66]"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Salvando...
                  </div>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
