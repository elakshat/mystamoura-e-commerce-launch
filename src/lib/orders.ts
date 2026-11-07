/**
 * Does an order count as a real sale on the dashboard?
 * Excludes cancelled/refunded orders and online checkouts whose payment was never
 * completed (payment_status 'awaiting' or 'failed'). Cash-on-delivery orders
 * (payment_status 'pending') do count.
 */
export function isRealOrder(o: { status?: string | null; payment_status?: string | null }): boolean {
  if (o.status === 'cancelled' || o.status === 'refunded') return false;
  if (o.payment_status === 'awaiting' || o.payment_status === 'failed') return false;
  return true;
}
