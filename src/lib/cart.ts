import { findAnyProduct } from "./products";
import { validateCoupon } from "./coupons";

export type CartItem = {
  productId: string;
  quantity: number;
  size: string;
  color: string;
};

export const CART_KEY = "riseclub-cart";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("riseclub-cart-updated"));
}

export function addToCart(item: CartItem) {
  const items = readCart();
  const found = items.find(
    (current) =>
      current.productId === item.productId &&
      current.size === item.size &&
      current.color === item.color
  );

  if (found) {
    found.quantity += item.quantity;
  } else {
    items.push(item);
  }

  saveCart(items);
}

export function getCartSummary(items: CartItem[], coupon = "") {
  const subtotal = items.reduce((total, item) => {
    const product = findAnyProduct(item.productId);
    return total + (product?.price || 0) * item.quantity;
  }, 0);
  const { discount } = validateCoupon(coupon, subtotal);
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const shipping = discountedSubtotal >= 250 || discountedSubtotal === 0 ? 0 : 18.9;

  return {
    count: items.reduce((total, item) => total + item.quantity, 0),
    subtotal,
    discount,
    shipping,
    total: discountedSubtotal + shipping
  };
}
