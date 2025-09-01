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
    <nav className="fixed bottom-0 inset-x-0 border-t bg-white text-black dark:bg-card dark:text-foreground z-40">
      <ul className="mx-auto max-w-sm grid grid-cols-4 gap-1 py-2 px-4">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <li key={href} className="flex items-center justify-center">
              <Link
                href={href}
                className={
                  "flex flex-col items-center justify-center gap-1 text-xs transition-colors" +
                  (active
                    ? " text-brand-600"
                    : " text-black dark:text-foreground")
                }
              >
                <span className="relative inline-flex">
                  <Icon
                    size={22}
                    className={active ? "text-brand-600" : undefined}
                  />
                  {label === "Carrinho" && count > 0 && (
                    <span className="absolute -top-1 -right-2 h-5 min-w-[20px] rounded-full bg-brand-600 px-1 text-[11px] leading-5 text-white text-center">
                      {count}
                    </span>
                  )}
                </span>
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
