import "@/styles/globals.css";
import "@/styles/theme.css";
import type { Metadata } from "next";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = { title: "Mercadito", description: "Auth" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh pb-16">
        {children}
        {/* Bottom navigation fixed for all pages */}
        <div className="block sm:hidden">
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
