"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, User, Search } from "lucide-react";
import ClientOnly from "./ClientOnly";

const items = [
  { href: "/", label: "Início", Icon: Home },
  { href: "/categorias", label: "Buscar", Icon: Search },
  { href: "/pedidos", label: "Pedidos", Icon: ShoppingBag },
  { href: "/perfil", label: "Perfil", Icon: User },
] as const;

function BottomNavContent() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-neutral-200 z-40 shadow-sol-elevated">
      <ul className="mx-auto max-w-sm grid grid-cols-4 gap-1 py-2 px-4">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <li key={href} className="flex items-center justify-center">
              <Link
                href={href}
                className={`flex flex-col items-center justify-center gap-1 text-xs transition-all duration-200 rounded-lg px-2 py-2 ${
                  active
                    ? "text-sol-orange bg-primary-50 sol-indicator-active"
                    : "text-sol-gray-medium hover:text-sol-orange"
                }`}
              >
                <span className="relative inline-flex">
                  <Icon
                    size={22}
                    className={
                      active ? "text-sol-orange" : "text-sol-gray-medium"
                    }
                    strokeWidth={active ? 2.5 : 1.5}
                  />
                </span>
                <span
                  className={`font-medium ${
                    active ? "text-sol-orange" : "text-sol-gray-medium"
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
        <div className="fixed bottom-0 inset-x-0 h-20 bg-white border-t border-neutral-200 z-40" />
      }
    >
      <BottomNavContent />
    </ClientOnly>
  );
}
