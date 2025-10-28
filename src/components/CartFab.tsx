"use client";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ClientOnly from "./ClientOnly";
import { Button } from "./ui/button";

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
    <Button
      onClick={handleCheckout}
      className="fixed bottom-20 rounded-none z-40 text-sm w-full bg-sol-gray-light text-sol-gray-dark hover:bg-sol-orange hover:text-white transition-all duration-200"
    >
      Ver carrinho | R${total.toFixed(2)}
    </Button>
  );
}

export default function CartFab() {
  return (
    <ClientOnly>
      <CartFabContent />
    </ClientOnly>
  );
}
