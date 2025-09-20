"use client";
import Link from "next/link";
import { Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

export default function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const inc = useCart((s) => s.inc);
  const dec = useCart((s) => s.dec);
  const { status } = useSession();
  const router = useRouter();
  const qty = useCart(
    (s) => s.items.find((i) => i.id === product.id)?.qty ?? 0
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    add({ id: product.id, name: product.name, price: product.price }, 1);
  };

  const handleQuantityChange = (e: React.MouseEvent, action: "inc" | "dec") => {
    e.preventDefault();
    if (action === "inc") {
      inc(product.id);
    } else {
      dec(product.id);
    }
  };

  const handleViewCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (status !== "authenticated") {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent("/checkout")}`);
    } else {
      router.push("/checkout");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Product Image */}
      <Link href={`/product/${product.id}`} className="block">
        <div className="aspect-square w-full bg-gray-50 flex items-center justify-center">
          <span className="text-sm text-gray-400">Imagem</span>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link href={`/product/${product.id}`} className="block">
          <p className="text-sm text-gray-500 mb-1">{product.category}</p>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
            {product.name}
          </h3>
          <p className="text-lg font-bold text-gray-900 mb-3">
            R$ {product.price.toFixed(2)}
          </p>
        </Link>

        {/* Promo Badge */}
        {product.promo && (
          <div className="mb-3">
            <span className="inline-block bg-brand-50 text-brand-600 text-xs px-2 py-1 rounded-full">
              {product.promo.label}
            </span>
          </div>
        )}

        {/* Add to Cart */}
        {qty <= 0 ? (
          <Button
            onClick={handleAddToCart}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-xl py-3 flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Adicionar ao carrinho
          </Button>
        ) : (
          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleQuantityChange(e, "dec")}
              className="h-8 w-8 p-0 hover:bg-gray-200"
            >
              <Minus size={14} />
            </Button>

            <Button
              variant="ghost"
              onClick={handleViewCart}
              className="flex-1 mx-2 text-sm font-medium hover:bg-gray-200"
            >
              {qty} no carrinho
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleQuantityChange(e, "inc")}
              className="h-8 w-8 p-0 hover:bg-gray-200"
            >
              <Plus size={14} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
