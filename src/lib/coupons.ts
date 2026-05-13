export type Coupon = {
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSubtotal: number;
  active: boolean;
};

const COUPON_KEY = "riseclub-coupons";

export const defaultCoupons: Coupon[] = [
  {
    code: "RISE10",
    type: "percent",
    value: 10,
    minSubtotal: 0,
    active: true
  },
  {
    code: "TREINO15",
    type: "fixed",
    value: 15,
    minSubtotal: 120,
    active: true
  }
];

export function readCustomCoupons(): Coupon[] {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(COUPON_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomCoupons(coupons: Coupon[]) {
  window.localStorage.setItem(COUPON_KEY, JSON.stringify(coupons));
  window.dispatchEvent(new Event("riseclub-coupons-updated"));
}

export function getAllCoupons() {
  return [...defaultCoupons, ...readCustomCoupons()];
}

export function validateCoupon(code: string, subtotal: number) {
  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) {
    return { coupon: null, discount: 0, message: "" };
  }

  const coupon = getAllCoupons().find((item) => item.code.toUpperCase() === normalizedCode);
  if (!coupon) {
    return { coupon: null, discount: 0, message: "Cupom nao encontrado." };
  }

  if (!coupon.active) {
    return { coupon, discount: 0, message: "Cupom inativo." };
  }

  if (subtotal < coupon.minSubtotal) {
    return {
      coupon,
      discount: 0,
      message: `Cupom valido a partir de ${coupon.minSubtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.`
    };
  }

  const rawDiscount = coupon.type === "percent" ? subtotal * (coupon.value / 100) : coupon.value;
  const discount = Math.min(subtotal, rawDiscount);
  return { coupon, discount, message: "Cupom aplicado." };
}
