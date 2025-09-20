"use client";
import { useCart } from "@/lib/cart";

export default function AddToCart({
  id,
  name,
  price,
}: {
  id: string;
  name: string;
  price: number;
}) {
  const add = useCart((s) => s.add);
  return (
    <button
      className="mt-2 w-full rounded-2xl border bg-[#F8B075] border-gray-300 py-2 text-sm"
      onClick={() => add({ id, name, price }, 1)}
    >
      Adicionar ao carrinho
    </button>
  );
}
