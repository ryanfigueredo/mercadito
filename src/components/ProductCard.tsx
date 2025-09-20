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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow relative">
      {/* Product Image */}
      <Link href={`/product/${product.id}`} className="block">
        <div className="aspect-square w-full bg-gray-50 flex items-center justify-center relative overflow-hidden">
          {product.image &&
          product.image !== "/next.svg" &&
          product.image !== "/vercel.svg" ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}
          <div
            className={`w-full h-full flex items-center justify-center ${
              product.image &&
              product.image !== "/next.svg" &&
              product.image !== "/vercel.svg"
                ? "hidden"
                : ""
            }`}
          >
            <span className="text-sm text-gray-400">Sem imagem</span>
          </div>
        </div>
      </Link>

      {/* Floating Add Button */}
      <div className="absolute bottom-5 right-5 transform">
        <Button
          onClick={handleAddToCart}
          className="w-8 h-8 rounded-full bg-[#F8B075] hover:bg-[#e6a065] text-white flex items-center justify-center p-0 shadow-lg"
        >
          <Plus size={16} />
        </Button>
      </div>

      {/* Product Info */}
      <div className="p-4 pt-6">
        <Link href={`/product/${product.id}`} className="block">
          <p className="text-sm text-gray-500 mb-1">{product.category}</p>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-gray-900 mb-3">
              R$ {product.price.toFixed(2)}
            </p>

            {/* Add to Cart */}
          </div>
        </Link>

        {/* Promo Badge */}
        {product.promo && (
          <div className="mb-3">
            <span className="inline-block bg-black-50 text-black text-xs px-2 py-1 rounded-full">
              {product.promo.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
