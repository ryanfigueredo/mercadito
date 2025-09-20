export type Category =
  | "Grãos"
  | "Bebidas"
  | "Hortifruti"
  | "Limpeza"
  | "Padaria";

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number; // in BRL
  image: string; // public path for now
  promo?: {
    label: string;
  };
}

export const products: Product[] = [
  {
    id: "arroz-camil-5kg",
    name: "Arroz Camil 5kg",
    category: "Grãos",
    price: 22.0,
    image: "/next.svg",
  },
  {
    id: "feijao-kicaldo-1kg",
    name: "Feijão Kicaldo 1kg",
    category: "Grãos",
    price: 8.0,
    image: "/vercel.svg",
  },
  {
    id: "oleo-soja-900ml",
    name: "Óleo de Soja 900ml",
    category: "Grãos",
    price: 6.9,
    image: "/globe.svg",
  },
  {
    id: "coca-cola-2l",
    name: "Coca-Cola 2L",
    category: "Bebidas",
    price: 11.5,
    image: "/window.svg",
  },
  {
    id: "pao-frances-500g",
    name: "Pão Francês 500g",
    category: "Padaria",
    price: 9.5,
    image: "/file.svg",
  },
];

export type FilterKey = "Tudo" | "Menor Preço" | "Ordem Alfabética";

export function applyFilter(list: Product[], key: FilterKey): Product[] {
  switch (key) {
    case "Menor Preço":
      return [...list].sort((a, b) => a.price - b.price);
    case "Ordem Alfabética":
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    case "Tudo":
    default:
      return list;
  }
}
