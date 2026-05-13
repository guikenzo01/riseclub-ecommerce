import type { CartItem } from "./cart";
import { getCartSummary } from "./cart";
import { decrementStock } from "./products";

export type Customer = {
  name: string;
  email: string;
  phone: string;
};

export type Address = {
  cep: string;
  street: string;
  number: string;
  city: string;
  state: string;
};

export type Order = {
  id: string;
  createdAt: string;
  status: "Recebido" | "Separando" | "Entregue";
  items: CartItem[];
  customer: Customer;
  address: Address;
  delivery: "Entrega" | "Retirada no treino";
  payment: string;
  coupon: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
};

const ORDER_KEY = "riseclub-orders";
export const orderStatuses: Order["status"][] = ["Recebido", "Separando", "Entregue"];

export function readOrders(): Order[] {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(ORDER_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveOrders(orders: Order[]) {
  window.localStorage.setItem(ORDER_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event("riseclub-orders-updated"));
}

export function createOrder(data: Omit<Order, "id" | "createdAt" | "status" | "subtotal" | "discount" | "shipping" | "total">) {
  const summary = getCartSummary(data.items, data.coupon);
  const pickup = data.delivery === "Retirada no treino";
  const order: Order = {
    ...data,
    id: `RC-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString(),
    status: "Recebido",
    subtotal: summary.subtotal,
    discount: summary.discount,
    shipping: pickup ? 0 : summary.shipping,
    total: pickup ? summary.subtotal - summary.discount : summary.total
  };

  saveOrders([order, ...readOrders()]);
  decrementStock(data.items);
  return order;
}

export function updateOrderStatus(orderId: string, status: Order["status"]) {
  const orders = readOrders();
  const nextOrders = orders.map((order) => order.id === orderId ? { ...order, status } : order);
  saveOrders(nextOrders);
  return nextOrders;
}

export function findOrder(orderId: string) {
  return readOrders().find((order) => order.id === orderId);
}
