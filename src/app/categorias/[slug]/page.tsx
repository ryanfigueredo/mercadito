import Topbar from "@/components/Topbar";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";
import { getCategoryBySlug } from "@/lib/categories";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "@/components/ui/icons";
import { notFound } from "next/navigation";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) return notFound();

  const list = products.filter((p) =>
    p.category.toLowerCase().includes(cat.name.toLowerCase())
  );

  return (
    <div className="min-h-dvh">
      <Topbar isLogged={false} />
      <main className="mx-auto max-w-sm px-4 pb-20">
        <h1 className="h-title mt-4">{cat.name}</h1>
        <div className="mt-3">
          <Input left={<SearchIcon />} placeholder="Busque por um item ou categoria" />
        </div>

        <section className="mt-3">
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


