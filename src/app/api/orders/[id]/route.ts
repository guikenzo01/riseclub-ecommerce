import { NextResponse } from "next/server";
import type { Order } from "@/lib/orders";
import { readStore, writeStore } from "@/server/store";

type OrderRouteProps = {
  params: {
    id: string;
  };
};

export async function PATCH(request: Request, { params }: OrderRouteProps) {
  const store = await readStore();
  const data = await request.json() as Partial<Order>;
  const order = store.orders.find((item) => item.id === params.id);

  if (!order) {
    return NextResponse.json({ message: "Pedido nao encontrado." }, { status: 404 });
  }

  const updatedOrder = { ...order, ...data };
  store.orders = store.orders.map((item) => item.id === params.id ? updatedOrder : item);
  await writeStore(store);
  return NextResponse.json(updatedOrder);
}

export async function GET(_request: Request, { params }: OrderRouteProps) {
  const store = await readStore();
  const order = store.orders.find((item) => item.id === params.id);

  if (!order) {
    return NextResponse.json({ message: "Pedido nao encontrado." }, { status: 404 });
  }

  return NextResponse.json(order);
}
