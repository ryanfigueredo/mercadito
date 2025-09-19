"use client";
import Link from "next/link";
import { Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const inc = useCart((s) => s.inc);
  const dec = useCart((s) => s.dec);
  const { status } = useSession();
  const router = useRouter();
  const qty = useCart(
    (s) => s.items.find((i) => i.id === product.id)?.qty ?? 0
  );
  return (
    <Link
      href={`/product/${product.id}`}
      className="block rounded-lg bg-card p-4 shadow-card border border-border hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
    >
      <div className="aspect-square w-full rounded-lg bg-brand-50 grid place-items-center mb-3 overflow-hidden">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-brand-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🛒</span>
            </div>
            <span className="text-xs text-muted">Sem imagem</span>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <p className="text-xs text-muted font-medium uppercase tracking-wide">{product.category}</p>
        <h3 className="font-semibold text-text leading-tight line-clamp-2">{product.name}</h3>
        
        {product.promo && (
          <div className="inline-flex items-center px-2 py-1 rounded-full bg-brand-50 text-xs font-medium text-brand-600">
            <span className="w-1.5 h-1.5 bg-brand-500 rounded-full mr-1"></span>
            {product.promo.label}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-1">
          <p className="font-bold text-lg text-text">R$ {product.price.toFixed(2)}</p>
          {qty <= 0 ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                add(
                  { id: product.id, name: product.name, price: product.price },
                  1
                );
              }}
              className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <span>+</span>
              Adicionar
            </button>
          ) : (
            <div className="flex items-center justify-between bg-brand-50 rounded-lg p-1">
              <button
                type="button"
                className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  dec(product.id);
                }}
              >
                −
              </button>
              <button
                type="button"
                aria-label="Ver carrinho"
                onClick={(e) => {
                  e.preventDefault();
                  if (status !== "authenticated") {
                    router.push(
                      `/auth/login?callbackUrl=${encodeURIComponent("/checkout")}`
                    );
                  } else {
                    router.push("/checkout");
                  }
                }}
                className="px-3 py-1 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                {qty}
              </button>
              <button
                type="button"
                className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  inc(product.id);
                }}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
