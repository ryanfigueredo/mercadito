export type CategoryInfo = {
  slug: string;
  name: string;
  image: string; // public path placeholder; replace with real later
};

export const categories: CategoryInfo[] = [
  { slug: "acougue", name: "Açougue", image: "/categories/acougue.jpg" },
  { slug: "graos", name: "Grãos", image: "/categories/graos.jpg" },
  {
    slug: "frutas-verduras",
    name: "Frutas e Verduras",
    image: "/categories/frutas-verduras.jpg",
  },
  { slug: "higiene", name: "Higiene", image: "/categories/higiene.jpg" },
  { slug: "limpeza", name: "Limpeza", image: "/categories/limpeza.jpg" },
  { slug: "diversos", name: "Diversos", image: "/categories/diversos.jpg" },
];

export function getCategoryBySlug(slug: string): CategoryInfo | undefined {
  return categories.find((c) => c.slug === slug);
}


