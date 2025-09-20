"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3X3, ShoppingBag, User } from "lucide-react";
import ClientOnly from "./ClientOnly";

const items = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/categorias", label: "Categorias", Icon: Grid3X3 },
  { href: "/pedidos", label: "Pedidos", Icon: ShoppingBag },
  { href: "/perfil", label: "Perfil", Icon: User },
] as const;

function BottomNavContent() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-40 shadow-lg">
      <ul className="mx-auto max-w-sm grid grid-cols-4 gap-1 py-2 px-4">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <li key={href} className="flex items-center justify-center">
              <Link
                href={href}
                className={`flex flex-col items-center justify-center gap-1 text-xs transition-all duration-200 rounded-lg px-2 py-2 ${
                  active
                    ? "text-brand-600 bg-brand-50"
                    : "text-gray-600 hover:text-brand-600 hover:bg-gray-50"
                }`}
              >
                <span className="relative inline-flex">
                  <Icon
                    size={22}
                    className={active ? "text-brand-600" : "text-gray-600"}
                    strokeWidth={active ? 2.5 : 1.5}
                  />
                </span>
                <span
                  className={`font-medium ${
                    active ? "text-brand-600" : "text-gray-600"
                  }`}
                >
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

export default function BottomNav() {
  return (
    <ClientOnly
      fallback={
        <div className="fixed bottom-0 inset-x-0 h-20 bg-card border-t border-border z-40" />
      }
    >
      <BottomNavContent />
    </ClientOnly>
  );
}
