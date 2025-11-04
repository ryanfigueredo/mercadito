"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { categories } from "@/lib/categories";
import ImageUpload from "@/components/ImageUpload";
import { Package, Upload, X, Image as ImageIcon, DollarSign, Tag, FileText } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    category: categories[0]?.name ?? "Diversos",
    price: "",
    promoText: "",
  });
  const [imageUrl, setImageUrl] = useState<string>("");
  const [productId, setProductId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Upload de imagem antes de criar o produto
  const handleImageSelect = async (file: File) => {
    // Validar tipo
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione apenas arquivos de imagem");
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Imagem muito grande. Máximo 5MB");
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Armazenar arquivo
    (fileInputRef.current as any).selectedFile = file;
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleImageSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleImageSelect(file);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Criar o produto (com ou sem imagem)
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price.replace(",", ".")),
          imageUrl: imageUrl || undefined,
          stock: 0, // Estoque inicia em 0
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao salvar produto");
      }

      const created = await response.json();
      setProductId(created.id); // Armazenar o ID do produto criado

      // Se tem arquivo selecionado mas ainda não foi feito upload, fazer agora
      const selectedFile = (fileInputRef.current as any)?.selectedFile;
      if (selectedFile && !imageUrl) {
        try {
          setUploadingImage(true);
          const formData = new FormData();
          formData.append("file", selectedFile);
          formData.append("productId", created.id);

          const uploadResponse = await fetch(
            "/api/admin/products/upload-image",
            {
              method: "POST",
              body: formData,
            }
          );

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            setImageUrl(uploadData.imageUrl);
            // Atualizar produto com a URL da imagem
            await fetch(`/api/admin/products/${created.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ imageUrl: uploadData.imageUrl }),
            });
          }
        } catch (uploadError) {
          console.error("Erro ao fazer upload da imagem:", uploadError);
          // Não falhar a criação do produto por erro no upload
          alert(
            "Produto criado, mas houve erro ao fazer upload da imagem. Você pode fazer upload depois."
          );
        } finally {
          setUploadingImage(false);
        }
      }

      router.push("/admin/produtos");
    } catch (error: unknown) {
      console.error("Erro ao salvar produto:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Erro ao salvar produto. Tente novamente."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            Novo produto
          </h1>
          <p className="text-gray-600 mt-1">Preencha as informações para cadastrar um novo produto</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2" asChild>
          <a href="/admin/produtos/importar">
            <Upload className="w-4 h-4" />
            Importar Excel
          </a>
        </Button>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
        <form onSubmit={submit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <FileText className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Informações Básicas</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Nome do Produto <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Ex: Arroz Camil 5kg"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-sm font-medium text-gray-700">
                  Código (SKU) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="slug"
                  placeholder="Ex: arroz-camil-5kg"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                  className="h-11"
                />
              </div>
            </div>

            {/* Categoria e Preço */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Categoria */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                  Categoria <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <select
                    id="category"
                    className="w-full h-11 rounded-xl border border-gray-300 px-4 appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Tag className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Preço */}
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                  Preço <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                  </div>
                  <Input
                    id="price"
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    className="h-11 pl-11"
                  />
                </div>
                <p className="text-xs text-gray-500">Exemplo: 9,90 ou 29.99</p>
              </div>
            </div>
          </div>

          {/* Imagem do Produto */}
          <div className="space-y-4 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-gray-600" />
              <Label htmlFor="image-upload" className="text-sm font-medium text-gray-700">
                Imagem do Produto
              </Label>
              <span className="text-xs text-gray-500">(opcional)</span>
            </div>

            {previewImage ? (
              <div className="space-y-3">
                <div className="relative inline-block group">
                  <div className="relative w-40 h-40 rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage(null);
                      (fileInputRef.current as any).selectedFile = null;
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Trocar Imagem
                </Button>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-xl p-8 text-center transition-all
                  ${
                    isDragging
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-300 hover:border-gray-400 bg-gray-50"
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                  disabled={uploadingImage}
                />
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-orange-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Clique para fazer upload ou arraste uma imagem
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG ou GIF até 5MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="flex items-center gap-2 mx-auto"
                  >
                    <Upload className="w-4 h-4" />
                    {uploadingImage ? "Processando..." : "Escolher Imagem"}
                  </Button>
                  <p className="text-xs text-gray-400 mt-2">
                    Você também pode fazer upload depois de criar o produto
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Promoção */}
          <div className="space-y-2 pt-6 border-t border-gray-100">
            <Label htmlFor="promoText" className="text-sm font-medium text-gray-700">
              Texto de Promoção
            </Label>
            <Input
              id="promoText"
              placeholder="Ex: Oferta especial! 20% OFF"
              value={form.promoText}
              onChange={(e) => setForm({ ...form, promoText: e.target.value })}
              className="h-11"
            />
            <p className="text-xs text-gray-500">Este texto aparecerá como destaque no produto</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saving || uploadingImage}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving || uploadingImage}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 min-w-[120px]"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </span>
              ) : uploadingImage ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </span>
              ) : (
                "Salvar Produto"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Upload de Imagem - Depois de criar (se produto já existe) */}
      {productId && !imageUrl && !previewImage && (
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <ImageUpload
            productId={productId}
            currentImageUrl={imageUrl}
            onImageUploaded={(url) => {
              setImageUrl(url);
              alert("Imagem enviada com sucesso!");
            }}
          />
        </div>
      )}
    </div>
  );
}
