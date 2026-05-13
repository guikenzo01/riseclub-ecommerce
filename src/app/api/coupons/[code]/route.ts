import { NextResponse } from "next/server";
import type { Coupon } from "@/lib/coupons";
import { readStore, writeStore } from "@/server/store";

type CouponRouteProps = {
  params: {
    code: string;
  };
};

export async function PATCH(request: Request, { params }: CouponRouteProps) {
  const store = await readStore();
  const code = params.code.toUpperCase();
  const data = await request.json() as Partial<Coupon>;
  const coupon = store.coupons.find((item) => item.code === code);

  if (!coupon) {
    return NextResponse.json({ message: "Cupom nao encontrado." }, { status: 404 });
  }

  const updatedCoupon = { ...coupon, ...data, code };
  store.coupons = store.coupons.map((item) => item.code === code ? updatedCoupon : item);
  await writeStore(store);
  return NextResponse.json(updatedCoupon);
}

export async function DELETE(_request: Request, { params }: CouponRouteProps) {
  const store = await readStore();
  store.coupons = store.coupons.filter((item) => item.code !== params.code.toUpperCase());
  await writeStore(store);
  return NextResponse.json({ ok: true });
}
