"use client";
import { useMemo, useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, PackageIcon } from "@/components/ui/icons";
import CartFab from "@/components/CartFab";

type DatabaseProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  priceCents: number;
  stock: number;
  imageUrl?: string;
  promoText?: string;
};

// Converter produto do banco para formato do ProductCard
function convertToProductCard(dbProduct: DatabaseProduct) {
  return {
    id: dbProduct.slug, // ProductCard usa slug como id
    name: dbProduct.name,
    category: dbProduct.category,
    price: dbProduct.priceCents / 100, // Converter centavos para reais
    image: dbProduct.imageUrl || "/api/images/placeholder",
    promo: dbProduct.promoText ? { label: dbProduct.promoText } : undefined,
  };
}

type FilterKey = "Tudo" | "Menor Preço" | "Ordem Alfabética";
const filters: FilterKey[] = ["Tudo", "Menor Preço", "Ordem Alfabética"];

export default function Home() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<FilterKey>("Tudo");
  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar produtos do banco de dados
  async function loadProducts() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/admin/products");
      if (!res.ok) {
        throw new Error("Erro ao carregar produtos");
      }

      const data = await res.json();

      // Filtrar apenas produtos com estoque > 0
      const availableProducts = data.filter(
        (p: DatabaseProduct) => p.stock > 0
      );
      setProducts(availableProducts);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      setError("Erro ao carregar produtos. Tente recarregar a página.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();

    // Listener para filtrar por categoria quando clicar nos banners
    const handleCategoryFilter = (event: any) => {
      const { category } = event.detail;
      setQuery(""); // Limpar busca
      setActive("Tudo"); // Resetar filtro

      // Filtrar por categoria específica
      setTimeout(() => {
        setQuery(category);
      }, 100);
    };

    window.addEventListener("filterByCategory", handleCategoryFilter);

    return () => {
      window.removeEventListener("filterByCategory", handleCategoryFilter);
    };
  }, []);

  // Aplicar filtros
  function applyFilter(
    list: DatabaseProduct[],
    key: FilterKey
  ): DatabaseProduct[] {
    switch (key) {
      case "Menor Preço":
        return [...list].sort((a, b) => a.priceCents - b.priceCents);
      case "Ordem Alfabética":
        return [...list].sort((a, b) => a.name.localeCompare(b.name));
      case "Tudo":
      default:
        return list;
    }
  }

  const list = useMemo(() => {
    const byFilter = applyFilter(products, active);
    if (!query) return byFilter;
    const q = query.toLowerCase();
    return byFilter.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [active, query, products]);

  // Converter para formato do ProductCard
  const productCards = useMemo(() => {
    return list.map(convertToProductCard);
  }, [list]);

  return (
    <div className="min-h-dvh">
      <Topbar isLogged={false} />
      <main className="mx-auto max-w-sm px-4 pb-32">
        <div className="mt-3">
          <Input
            left={<SearchIcon />}
            placeholder="Busque por um item ou categoria"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <FeaturedCarousel />

        {/* Filtros */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Produtos</h2>
            <span className="text-sm text-gray-500">
              {loading
                ? "..."
                : `${productCards.length} ${
                    productCards.length === 1 ? "produto" : "produtos"
                  }`}
            </span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            {filters.map((f) => (
              <Button
                key={f}
                variant="ghost"
                onClick={() => setActive(f)}
                className={`shrink-0 rounded-full px-3 py-2 text-sm ${
                  active === f ? "bg-[#F8B075] text-white" : "bg-gray-200"
                }`}
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        <section className="mt-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-[#F8B075] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando produtos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <PackageIcon size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Erro ao carregar produtos
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button
                onClick={loadProducts}
                className="bg-[#F8B075] hover:bg-[#e69a66]"
              >
                Tentar Novamente
              </Button>
            </div>
          ) : productCards.length === 0 ? (
            <div className="text-center py-12">
              <PackageIcon size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {query
                  ? "Nenhum produto encontrado"
                  : "Nenhum produto disponível"}
              </h3>
              <p className="text-gray-600">
                {query
                  ? "Tente buscar por outro termo"
                  : "Produtos em estoque aparecerão aqui"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {productCards.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </main>
      <CartFab />
    </div>
  );
}
