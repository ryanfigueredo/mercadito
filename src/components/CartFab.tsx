"use client";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CartFab() {
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total());
  const { status } = useSession();
  const router = useRouter();

  if (items.length === 0) return null;

  const handleCheckout = () => {
    if (status !== "authenticated") {
      // Se não estiver logado, redireciona para login com callback para checkout
      router.push(`/auth/login?callbackUrl=${encodeURIComponent("/checkout")}`);
    } else {
      // Se estiver logado, vai para checkout
      router.push("/checkout");
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-brand-600 hover:bg-brand-700 text-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 font-semibold min-w-[200px] justify-center"
    >
      <div className="relative">
        <span className="text-xl">🛒</span>
        {items.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {items.length}
          </span>
        )}
      </div>
      <div className="text-left">
        <div className="text-sm">Ver carrinho</div>
        <div className="text-xs opacity-90">{items.length} itens • R$ {total.toFixed(2)}</div>
      </div>
    </button>
  );
}
