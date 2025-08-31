import Link from "next/link";

export default function AdminHome() {
  const cards = [
    {
      href: "/admin/pedidos",
      title: "Pedidos",
      desc: "Aprovar, enviar, entregar",
    },
    {
      href: "/admin/estoque",
      title: "Estoque",
      desc: "Produtos e quantidades",
    },
  ];
  return (
    <div className="space-y-4">
      <h1 className="h-title">Admin</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-2xl border p-4 bg-white"
          >
            <h2 className="font-semibold">{c.title}</h2>
            <p className="text-sm text-muted">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
