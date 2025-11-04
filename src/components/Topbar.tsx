"use client";
import Image from "next/image";
import Link from "next/link";
import NotificationBell from "@/components/NotificationBell";

export default function Topbar({
  address: _address,
  isLogged: _isLogged,
}: {
  address?: string;
  isLogged?: boolean;
}) {
  return (
    <header className="sticky top-0 z-20 sol-header backdrop-blur bg-sol-orange/95">
      <div className="mx-auto max-w-sm px-4 py-3 flex items-center justify-between">
        <Link href="/" className="shrink-0" aria-label="Mercadito">
          <Image
            src="/mercadito.svg"
            alt="mercadito"
            width={120}
            height={24}
            priority
            className="filter brightness-0 invert"
          />
        </Link>
        <NotificationBell />
      </div>
    </header>
  );
}
