import { Coupon } from '@/types';

const KEY = 'applied_coupon';

export function saveAppliedCoupon(coupon: Coupon | null) {
  if (coupon) sessionStorage.setItem(KEY, JSON.stringify(coupon));
  else sessionStorage.removeItem(KEY);
}

export function loadAppliedCoupon(): Coupon | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Coupon) : null;
  } catch {
    return null;
  }
}

/** Discount for a coupon, never more than the subtotal; 0 if minimum not met. */
export function calculateDiscount(coupon: Coupon | null, subtotal: number): number {
  if (!coupon || subtotal <= 0) return 0;
  if (subtotal < (coupon.min_order_amount || 0)) return 0;
  const raw =
    coupon.discount_type === 'percentage'
      ? (subtotal * coupon.discount_value) / 100
      : coupon.discount_value;
  return Math.round(Math.min(raw, subtotal) * 100) / 100;
}
