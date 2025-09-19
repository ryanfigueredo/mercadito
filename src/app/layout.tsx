import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import BottomNav from "@/components/BottomNav";
import CartFab from "@/components/CartFab";
import AuthProvider from "@/components/AuthProvider";

export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mercadito",
  description: "Seu mercado digital",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <BottomNav />
          <CartFab />
        </AuthProvider>
      </body>
    </html>
  );
}
