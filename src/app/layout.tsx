import "@/styles/globals.css";
import "@/styles/theme.css";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mercadito", description: "Auth" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
