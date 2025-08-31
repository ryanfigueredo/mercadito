export type OrderStatus = "AWAITING_CUSTOMER_CONFIRMATION" | "DELIVERED";

export interface OrderItem {
  name: string;
  qty: number;
  unitPrice: number;
}

export interface OrderAddress {
  label: string;
  line: string;
  distanceKm?: number;
}

export interface Order {
  id: string;
  number: number;
  status: OrderStatus;
  createdAt: string; // ISO string
  address: OrderAddress;
  freight: number;
  items: OrderItem[];
  deliveredAt?: string; // "13:45" etc
}

export function formatBRL(value: number): string {
  return value
    .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    .replace("R$\u00a0", "R$ ");
}

export function orderTotals(order: Order): { qty: number; total: number } {
  const qty = order.items.reduce((s, i) => s + i.qty, 0);
  const itemsTotal = order.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  return { qty, total: itemsTotal + order.freight };
}

export function getMockOrders(): { current: Order | null; history: Order[] } {
  const baseAddress: OrderAddress = {
    label: "Minha Casa",
    line: "Rua das Oliveiras nº 400, Jardim Campos",
    distanceKm: 4.7,
  };

  const exampleItems: OrderItem[] = [
    { name: "Arroz Camil 5kg", qty: 2, unitPrice: 22 },
    { name: "Feijão Kicaldo 1kg", qty: 1, unitPrice: 8 },
  ];

  const current: Order = {
    id: "cur-3254",
    number: 3254,
    status: "AWAITING_CUSTOMER_CONFIRMATION",
    createdAt: "2025-08-14T11:25:00.000Z",
    address: baseAddress,
    freight: 20,
    items: exampleItems,
  };

  const history: Order[] = [
    {
      id: "h1-3254",
      number: 3254,
      status: "DELIVERED",
      createdAt: "2025-08-13T10:15:00.000Z",
      deliveredAt: "13:45",
      address: baseAddress,
      freight: 20,
      items: exampleItems,
    },
    {
      id: "h2-3254",
      number: 3254,
      status: "DELIVERED",
      createdAt: "2025-08-12T10:15:00.000Z",
      deliveredAt: "13:45",
      address: baseAddress,
      freight: 20,
      items: exampleItems,
    },
  ];

  return { current, history };
}
