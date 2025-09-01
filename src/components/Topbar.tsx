"use client";
import Image from "next/image";
import Link from "next/link";
import { BellIcon } from "@/components/ui/icons";

export default function Topbar({
  address: _address,
  isLogged: _isLogged,
}: {
  address?: string;
  isLogged?: boolean;
}) {
  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-sm px-4 py-3 flex items-center gap-3">
        <Link href="/" className="shrink-0" aria-label="Mercadito">
          <Image
            src="/mercaditoColor.svg"
            alt="mercadito"
            width={120}
            height={24}
            priority
          />
        </Link>
        <button
          aria-label="Notificações"
          className="ml-auto rounded-full p-2 hover:bg-brand-50"
        >
          <BellIcon />
        </button>
      </div>
    </header>
  );
}
