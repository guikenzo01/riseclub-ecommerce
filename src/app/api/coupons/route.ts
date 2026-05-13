import { NextResponse } from "next/server";
import type { Coupon } from "@/lib/coupons";
import { readStore, writeStore } from "@/server/store";

export async function GET() {
  const store = await readStore();
  return NextResponse.json(store.coupons);
}

export async function POST(request: Request) {
  const store = await readStore();
  const data = await request.json() as Coupon;
  const coupon: Coupon = {
    code: data.code.trim().toUpperCase(),
    type: data.type,
    value: Number(data.value),
    minSubtotal: Number(data.minSubtotal),
    active: data.active
  };

  store.coupons = [coupon, ...store.coupons.filter((item) => item.code !== coupon.code)];
  await writeStore(store);
  return NextResponse.json(coupon, { status: 201 });
}
