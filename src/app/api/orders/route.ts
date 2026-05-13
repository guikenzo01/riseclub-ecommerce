import { NextResponse } from "next/server";
import type { Order } from "@/lib/orders";
import { calculateOrderTotals, decrementProductStock, readStore, validateStock, writeStore } from "@/server/store";

export async function GET() {
  const store = await readStore();
  return NextResponse.json(store.orders);
}

export async function POST(request: Request) {
  const store = await readStore();
  const data = await request.json() as Omit<Order, "id" | "createdAt" | "status" | "subtotal" | "discount" | "shipping" | "total">;
  const stockValidation = validateStock(store.products, data.items);

  if (!stockValidation.ok) {
    return NextResponse.json({ message: stockValidation.message }, { status: 409 });
  }

  const pickup = data.delivery === "Retirada no treino";
  const totals = calculateOrderTotals(store.products, store.coupons, data.items, data.coupon, pickup);
  const order: Order = {
    ...data,
    id: `RC-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString(),
    status: "Recebido",
    ...totals
  };

  store.orders = [order, ...store.orders];
  store.products = decrementProductStock(store.products, data.items);
  await writeStore(store);
  return NextResponse.json(order, { status: 201 });
}
