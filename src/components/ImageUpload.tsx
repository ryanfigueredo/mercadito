"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImageUploadProps {
  productId: string;
  currentImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
}

export default function ImageUpload({
  productId,
  currentImageUrl,
  onImageUploaded,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("productId", productId);

      const response = await fetch("/api/admin/products/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao fazer upload");
      }

      onImageUploaded(data.imageUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao fazer upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="image-upload">Imagem do Produto</Label>

      {currentImageUrl && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Imagem atual:</p>
          <img
            src={currentImageUrl}
            alt="Produto"
            className="w-32 h-32 object-cover rounded-lg border"
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <Input
          ref={fileInputRef}
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Enviando..." : "Escolher Imagem"}
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <p className="text-xs text-muted-foreground">
        Formatos aceitos: JPG, PNG, GIF (máximo 5MB)
      </p>
    </div>
  );
}
