"use client";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";

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
    <Button
      variant="default"
      className="mt-2 w-full"
      onClick={() => add({ id, name, price }, 1)}
    >
      Adicionar ao carrinho
    </Button>
  );
}
