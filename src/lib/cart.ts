"use client";
import { create } from "zustand";
import { useEffect } from "react";

export type CartItem = {
  id: string; // product slug
  name: string;
  price: number; // BRL number
  qty: number;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  clear: () => void;
  total: () => number;
};

const persistKey = "mercadito_cart_v1";

function loadInitial(): CartItem[] {
  try {
    const raw = localStorage.getItem(persistKey);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  add: (item, qty = 1) =>
    set((s) => {
      const existing = s.items.find((i) => i.id === item.id);
      const items = existing
        ? s.items.map((i) =>
            i.id === item.id ? { ...i, qty: i.qty + qty } : i
          )
        : [...s.items, { ...item, qty }];
      localStorage.setItem(persistKey, JSON.stringify(items));
      return { items };
    }),
  remove: (id) =>
    set((s) => {
      const items = s.items.filter((i) => i.id !== id);
      localStorage.setItem(persistKey, JSON.stringify(items));
      return { items };
    }),
  inc: (id) =>
    set((s) => {
      const items = s.items.map((i) =>
        i.id === id ? { ...i, qty: i.qty + 1 } : i
      );
      localStorage.setItem(persistKey, JSON.stringify(items));
      return { items };
    }),
  dec: (id) =>
    set((s) => {
      const items = s.items
        .map((i) => (i.id === id ? { ...i, qty: Math.max(0, i.qty - 1) } : i))
        .filter((i) => i.qty > 0);
      localStorage.setItem(persistKey, JSON.stringify(items));
      return { items };
    }),
  clear: () => {
    localStorage.removeItem(persistKey);
    set({ items: [] });
  },
  total: () => get().items.reduce((s, i) => s + i.qty * i.price, 0),
}));

// Hook para inicializar o carrinho apenas no cliente
export function useCartHydration() {
  useEffect(() => {
    const items = loadInitial();
    if (items.length > 0) {
      useCart.setState({ items });
    }
  }, []);
}
