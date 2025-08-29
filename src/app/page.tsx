"use client";
import { useMemo, useState } from "react";
import Topbar from "@/components/Topbar";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "@/components/ui/icons";
import { products, applyFilter, type FilterKey } from "@/lib/products";

const filters: FilterKey[] = ["Tudo", "Menor Preço", "Ordem Alfabética"];

export default function Home() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<FilterKey>("Tudo");

  const list = useMemo(() => {
    const byFilter = applyFilter(products, active);
    if (!query) return byFilter;
    const q = query.toLowerCase();
    return byFilter.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [active, query]);

  return (
    <div className="min-h-dvh">
      <Topbar isLogged={false} />
      <main className="mx-auto max-w-sm px-4 pb-20">
        <div className="mt-3">
          <Input
            left={<SearchIcon />}
            placeholder="Busque por um item ou categoria"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <FeaturedCarousel />

        <div className="mt-4 flex items-center gap-3 overflow-x-auto no-scrollbar">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`shrink-0 rounded-full px-3 py-2 text-sm ${
                active === f ? "bg-brand-600 text-white" : "bg-gray-100"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <section className="mt-3">
          <h2 className="sr-only">Ofertas do dia</h2>
          <div className="grid grid-cols-2 gap-3">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
