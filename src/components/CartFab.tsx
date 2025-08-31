"use client";
import Link from "next/link";
import { useCart } from "@/lib/cart";

export default function CartFab() {
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total());
  if (items.length === 0) return null;
  return (
    <Link
      href="/checkout"
      className="fixed bottom-16 left-1/2 -translate-x-1/2 z-40 rounded-full bg-brand-600 text-white px-5 py-3 shadow-lg"
    >
      Ver carrinho • {items.length} itens • R$ {total.toFixed(2)}
    </Link>
  );
}
