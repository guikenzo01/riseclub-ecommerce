import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/server/store";
import type { Product } from "@/lib/products";
import { slugify } from "@/lib/products";

export async function GET() {
  const store = await readStore();
  return NextResponse.json(store.products);
}

export async function POST(request: Request) {
  const store = await readStore();
  const data = await request.json() as Partial<Product>;
  const id = data.id || slugify(data.name || `produto-${Date.now()}`);
  const product: Product = {
    id,
    name: data.name || "Produto Rise",
    category: data.category || "Vestuario",
    price: Number(data.price || 0),
    oldPrice: data.oldPrice ? Number(data.oldPrice) : undefined,
    image: data.image || "/gallery/02.jpg",
    badge: data.badge || "Novo",
    rating: Number(data.rating || 4.8),
    stock: Number(data.stock || 0),
    description: data.description || "",
    details: data.details || [],
    colors: data.colors || ["Preto"],
    sizes: data.sizes || ["Unico"],
    sku: data.sku || `RC-${id.slice(0, 8).toUpperCase()}`,
    active: data.active ?? true
  };

  store.products = [product, ...store.products.filter((item) => item.id !== product.id)];
  await writeStore(store);
  return NextResponse.json(product, { status: 201 });
}
