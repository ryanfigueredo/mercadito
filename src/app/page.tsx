"use client";
import { useMemo, useState } from "react";
import Topbar from "@/components/Topbar";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "@/components/ui/icons";
import { products, applyFilter, type FilterKey } from "@/lib/products";
import CartFab from "@/components/CartFab";

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
    <div className="min-h-dvh bg-bg">
      <Topbar isLogged={false} />
      <main className="mx-auto max-w-sm px-4 pb-24">
        {/* Search Bar */}
        <div className="mt-4">
          <div className="relative">
            <Input
              left={<SearchIcon />}
              placeholder="Busque por um item ou categoria"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-card border-border shadow-card"
            />
          </div>
        </div>

        {/* Featured Carousel */}
        <div className="mt-6">
          <FeaturedCarousel />
        </div>

        {/* Filters */}
        <div className="mt-6 flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                active === f 
                  ? "bg-brand-500 text-white shadow-md" 
                  : "bg-card text-muted border border-border hover:border-brand-400 hover:text-brand-500"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Products Section */}
        <section className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text">Produtos</h2>
            <span className="text-sm text-muted">{list.length} produtos</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {list.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-muted mb-2">Nenhum produto encontrado</h3>
              <p className="text-sm text-muted">Tente ajustar sua busca ou filtros</p>
            </div>
          )}
        </section>
      </main>
      <CartFab />
    </div>
  );
}
