import Link from "next/link";
import Topbar from "@/components/Topbar";
import { categories } from "@/lib/categories";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "@/components/ui/icons";

export default function CategoriasPage() {
  return (
    <div className="min-h-dvh">
      <Topbar isLogged={false} />
      <main className="mx-auto max-w-sm px-4 pb-20">
        <h1 className="h-title mt-4">Categorias</h1>
        <div className="mt-3">
          <Input left={<SearchIcon />} placeholder="Busque por um item ou categoria" />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/categorias/${c.slug}`}
              className="relative rounded-2xl h-40 overflow-hidden"
            >
              {/* Background slot: substitua a URL no arquivo categories.ts */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${c.image})` }}
              />
              <div className="absolute inset-0 bg-black/30" />
              <div className="relative z-10 h-full w-full grid place-items-center">
                <span className="text-white font-semibold text-lg drop-shadow">
                  {c.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
