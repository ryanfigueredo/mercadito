import { notFound } from "next/navigation";
import Topbar from "@/components/Topbar";
import { products } from "@/lib/products";
import BuyNowButton from "@/components/BuyNowButton";
import AddToCart from "@/components/AddToCart";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = products.find((p) => p.id === decodeURIComponent(id));
  if (!product) return notFound();

  return (
    <div className="min-h-dvh">
      <Topbar isLogged={false} />
      <main className="mx-auto max-w-sm px-4 pb-32">
        <div className="mt-3 rounded-2xl bg-black-50 aspect-square grid place-items-center">
          <span className="text-sm text-muted">Imagem</span>
        </div>
        <div className="card p-4 mt-3">
          <p className="text-sm text-muted">{product.category}</p>
          <h1 className="text-xl font-semibold">{product.name}</h1>
          <p className="mt-2 text-2xl font-bold">
            R$ {product.price.toFixed(2)}
          </p>
          {product.promo && (
            <div className="mt-2 rounded-xl bg-black-50 px-3 py-2 text-sm text-black-700">
              {product.promo.label}
            </div>
          )}
          <div className="mt-4 text-sm leading-relaxed text-muted">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur
            nec.
          </div>
          <BuyNowButton
            id={product.id}
            name={product.name}
            unit_price={product.price}
          />
          <AddToCart
            id={product.id}
            name={product.name}
            price={product.price}
          />
        </div>
      </main>
    </div>
  );
}
