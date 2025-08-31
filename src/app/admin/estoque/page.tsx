"use client";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  priceCents: number;
};

export default function EstoquePage() {
  const [q, setQ] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  async function load() {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data);
  }

  useEffect(() => {
    load();
  }, []);

  const list = useMemo(() => {
    const t = q.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(t) || p.category.toLowerCase().includes(t)
    );
  }, [products, q]);

  return (
    <div>
      <h1 className="h-title mb-3">Estoque</h1>
      <div className="flex gap-2">
        <Input
          left={<SearchIcon />}
          placeholder="Busque por um item, código ou grupo"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Link href="/admin/produtos/novo">
          <Button>Novo produto</Button>
        </Link>
      </div>

      <div className="mt-4 overflow-auto rounded-2xl border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-muted">
            <tr>
              <th className="text-left p-3">SKU</th>
              <th className="text-left p-3">Produto</th>
              <th className="text-left p-3">Categoria</th>
              <th className="text-left p-3">Preço</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.slug}</td>
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.category}</td>
                <td className="p-3">R$ {(p.priceCents / 100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
