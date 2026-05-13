import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/server/store";
import type { Product } from "@/lib/products";

type ProductRouteProps = {
  params: {
    id: string;
  };
};

export async function PATCH(request: Request, { params }: ProductRouteProps) {
  const store = await readStore();
  const data = await request.json() as Partial<Product>;
  const product = store.products.find((item) => item.id === params.id);

  if (!product) {
    return NextResponse.json({ message: "Produto nao encontrado." }, { status: 404 });
  }

  const updatedProduct = { ...product, ...data };
  store.products = store.products.map((item) => item.id === params.id ? updatedProduct : item);
  await writeStore(store);
  return NextResponse.json(updatedProduct);
}

export async function DELETE(_request: Request, { params }: ProductRouteProps) {
  const store = await readStore();
  store.products = store.products.filter((item) => item.id !== params.id);
  await writeStore(store);
  return NextResponse.json({ ok: true });
}
