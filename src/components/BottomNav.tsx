"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, GridIcon, BagIcon, UserIcon } from "@/components/ui/icons";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";

const items = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/categorias", label: "Categorias", Icon: GridIcon },
  // Novo item do carrinho
  { href: "/checkout", label: "Carrinho", Icon: ShoppingCart },
  { href: "/pedidos", label: "Pedidos", Icon: BagIcon },
  { href: "/perfil", label: "Perfil", Icon: UserIcon },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-card border-t border-border z-40">
      <ul className="mx-auto max-w-sm grid grid-cols-5 gap-1 py-3 px-4">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <li key={href} className="flex items-center justify-center">
              <Link
                href={href}
                className={`flex flex-col items-center justify-center gap-1 text-xs transition-all duration-200 ${
                  active
                    ? "text-brand-600 scale-105"
                    : "text-muted hover:text-text"
                }`}
              >
                <span className="relative inline-flex">
                  <Icon
                    size={24}
                    className={active ? "text-brand-600" : "text-muted"}
                  />
                  {label === "Carrinho" && count > 0 && (
                    <span className="absolute -top-2 -right-2 h-5 min-w-[20px] rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center">
                      {count}
                    </span>
                  )}
                </span>
                <span className={active ? "font-semibold" : "font-medium"}>
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
