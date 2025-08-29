"use client";
import Image from "next/image";
import Link from "next/link";
import { BellIcon, ChevronDownIcon, MapPinIcon } from "@/components/ui/icons";

export default function Topbar({
  address,
  isLogged,
}: {
  address?: string;
  isLogged?: boolean;
}) {
  const addressText = isLogged && address ? address : "Entre em sua conta";
  const subText =
    isLogged && address ? "Minha casa" : "para registrar endereço";

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

        <button className="flex min-w-0 items-center gap-2 rounded-xl border border-gray-200 px-2 py-1 text-left">
          <MapPinIcon />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{addressText}</p>
            <p className="-mt-0.5 text-[11px] text-muted truncate">{subText}</p>
          </div>
          <ChevronDownIcon className="ml-auto" />
        </button>

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
