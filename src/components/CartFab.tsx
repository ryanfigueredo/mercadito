"use client";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ClientOnly from "./ClientOnly";

function CartFabContent() {
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
      className="fixed bottom-16 left-1/2 -translate-x-1/2 z-40 rounded-full bg-brand-600 text-white px-5 py-3 shadow-lg hover:bg-brand-700 transition-colors"
    >
      Ver carrinho • {items.length} itens • R$ {total.toFixed(2)}
    </button>
  );
}

export default function CartFab() {
  return (
    <ClientOnly>
      <CartFabContent />
    </ClientOnly>
  );
}
