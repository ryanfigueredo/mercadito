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
            className="mt-2 w-full rounded-2xl border border-gray-300 py-2 text-sm"
          >
            Adicionar
          </button>
        ) : (
          <div className="mt-2 flex items-center justify-between rounded-2xl border border-gray-300">
            <button
              type="button"
              className="h-10 w-12 text-lg"
              onClick={(e) => {
                e.preventDefault();
                dec(product.id);
              }}
            >
              −
            </button>
            <button
              type="button"
              aria-label="Abrir carrinho"
              onClick={(e) => {
                e.preventDefault();
                if (status !== "authenticated") {
                  // Se não estiver logado, redireciona para login com callback para checkout
                  router.push(
                    `/auth/login?callbackUrl=${encodeURIComponent("/checkout")}`
                  );
                } else {
                  // Se estiver logado, vai para checkout
                  router.push("/checkout");
                }
              }}
              className="px-2 text-sm underline underline-offset-2"
            >
              {qty}
            </button>
            <button
              type="button"
              className="h-10 w-12 text-lg"
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
    </Link>
  );
}
