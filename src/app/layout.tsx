import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import BottomNav from "@/components/BottomNav";
import CartFab from "@/components/CartFab";
import AuthProvider from "@/components/AuthProvider";
import CartHydration from "@/components/CartHydration";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mercadito",
  description: "Mercado online com os melhores preços",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body
        className={cn(
          inter.className,
          "min-h-screen bg-white text-neutral-900"
        )}
      >
        <AuthProvider>
          <CartHydration />
          <div className="min-h-screen pb-[calc(96px+env(safe-area-inset-bottom))] md:pb-0">
            {children}
          </div>
          <BottomNav />
          <CartFab />
        </AuthProvider>
      </body>
    </html>
  );
}
