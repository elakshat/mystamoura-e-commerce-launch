import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `MYS-${dateStr}-${random}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

// Muted, on-brand status tones (full class strings so Tailwind keeps them).
const TONE = {
  amber: 'bg-[hsl(38_78%_91%)] text-[hsl(30_70%_30%)] border-[hsl(36_60%_78%)]',
  slate: 'bg-[hsl(208_40%_92%)] text-[hsl(210_45%_28%)] border-[hsl(208_30%_80%)]',
  plum: 'bg-[hsl(268_25%_93%)] text-[hsl(268_28%_34%)] border-[hsl(268_20%_82%)]',
  teal: 'bg-[hsl(186_30%_90%)] text-[hsl(190_45%_24%)] border-[hsl(186_25%_78%)]',
  sage: 'bg-[hsl(140_26%_90%)] text-[hsl(145_35%_25%)] border-[hsl(140_20%_78%)]',
  rose: 'bg-[hsl(2_55%_93%)] text-[hsl(2_55%_36%)] border-[hsl(2_40%_82%)]',
  muted: 'bg-muted text-muted-foreground border-border',
};

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: TONE.amber,
    awaiting: TONE.amber,
    paid: TONE.slate,
    processing: TONE.plum,
    shipped: TONE.teal,
    delivered: TONE.sage,
    completed: TONE.sage,
    cancelled: TONE.rose,
    failed: TONE.rose,
    refunded: TONE.muted,
  };
  return colors[status] || TONE.muted;
}

export function getPaymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: TONE.amber,
    awaiting: TONE.amber,
    completed: TONE.sage,
    failed: TONE.rose,
  };
  return colors[status] || TONE.muted;
}
