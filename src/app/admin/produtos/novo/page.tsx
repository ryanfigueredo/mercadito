"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { categories } from "@/lib/categories";

export default function NewProductPage() {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    category: categories[0]?.name ?? "Diversos",
    price: "",
    imageUrl: "",
    promoText: "",
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: Number(form.price.replace(",", ".")),
      }),
    });
    setSaving(false);
    history.back();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="h-title">Novo produto</h1>
        <Button variant="outline" asChild>
          <a href="/admin/produtos/importar">Importar Excel</a>
        </Button>
      </div>
      <form className="space-y-3" onSubmit={submit}>
        <Input
          placeholder="Nome"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          placeholder="Slug (SKU)"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
        />

        <div>
          <label className="mb-1 block text-sm text-muted">Categoria</label>
          <select
            className="w-full h-11 rounded-2xl border border-gray-300 px-3"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <Input
          placeholder="Preço (ex: 9,90)"
          inputMode="decimal"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        <Input
          placeholder="Imagem URL (opcional)"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
        />

        <Input
          placeholder="Promoção (opcional)"
          value={form.promoText}
          onChange={(e) => setForm({ ...form, promoText: e.target.value })}
        />

        <Button type="submit" disabled={saving}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </form>
    </div>
  );
}
