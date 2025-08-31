export type CategoryInfo = {
  slug: string;
  name: string;
  image: string; // public path placeholder; replace with real later
};

export const categories: CategoryInfo[] = [
  { slug: "acougue", name: "Açougue", image: "/acougue.png" },
  { slug: "graos", name: "Grãos", image: "/graos.png" },
  {
    slug: "frutas-verduras",
    name: "Frutas e Verduras",
    image: "/frutas.png",
  },
  { slug: "higiene", name: "Higiene", image: "/higiene.png" },
  { slug: "limpeza", name: "Limpeza", image: "/limpeza.png" },
  { slug: "diversos", name: "Diversos", image: "/diversos.png" },
];

export function getCategoryBySlug(slug: string): CategoryInfo | undefined {
  return categories.find((c) => c.slug === slug);
}
