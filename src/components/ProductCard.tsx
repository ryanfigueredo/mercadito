import Link from "next/link";
import { Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="block rounded-2xl bg-white p-3 shadow-sm border border-gray-200"
    >
      <div className="aspect-[4/5] w-full rounded-xl bg-brand-50 grid place-items-center">
        {/* Placeholder: replace with real image later */}
        <span className="text-sm text-muted">Imagem</span>
      </div>
      <div className="mt-2">
        <p className="text-sm text-muted">{product.category}</p>
        <p className="font-medium leading-snug">{product.name}</p>
        {product.promo && (
          <div className="mt-1 rounded-lg bg-brand-50 px-2 py-1 text-[11px] text-brand-600">
            {product.promo.label}
          </div>
        )}
        <p className="mt-1 font-semibold">R$ {product.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}
