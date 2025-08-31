import Topbar from "@/components/Topbar";
import BottomNav from "@/components/BottomNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh">
      <Topbar isLogged address="Rua das Laranjeiras nº 100" />
      <main className="mx-auto max-w-sm px-4 pb-24 pt-4">{children}</main>
      <BottomNav />
    </div>
  );
}
