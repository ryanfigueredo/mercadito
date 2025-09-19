"use client";
import { useCartHydration } from "@/lib/cart";

export default function CartHydration() {
  useCartHydration();
  return null;
}
