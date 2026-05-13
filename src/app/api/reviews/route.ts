import { NextRequest, NextResponse } from "next/server";
import type { Review } from "@/lib/reviews";
import { readStore, writeStore } from "@/server/store";

export async function GET(request: NextRequest) {
  const store = await readStore();
  const productId = request.nextUrl.searchParams.get("productId");
  const reviews = productId
    ? store.reviews.filter((review) => review.productId === productId)
    : store.reviews;
  return NextResponse.json(reviews);
}

export async function POST(request: Request) {
  const store = await readStore();
  const data = await request.json() as Omit<Review, "id" | "createdAt">;
  const review: Review = {
    ...data,
    id: `RV-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString()
  };

  store.reviews = [review, ...store.reviews];
  await writeStore(store);
  return NextResponse.json(review, { status: 201 });
}
