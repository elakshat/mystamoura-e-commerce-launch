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

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-warning/20 text-warning',
    awaiting: 'bg-warning/20 text-warning',
    paid: 'bg-primary/20 text-primary',
    processing: 'bg-accent/50 text-accent-foreground',
    shipped: 'bg-secondary text-secondary-foreground',
    delivered: 'bg-primary/20 text-primary',
    cancelled: 'bg-destructive/20 text-destructive',
    refunded: 'bg-muted text-muted-foreground',
    failed: 'bg-destructive/20 text-destructive',
    completed: 'bg-primary/20 text-primary',
  };
  return colors[status] || 'bg-muted text-muted-foreground';
}

export function getPaymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-warning/20 text-warning',
    awaiting: 'bg-warning/20 text-warning',
    completed: 'bg-primary/20 text-primary',
    failed: 'bg-destructive/20 text-destructive',
  };
  return colors[status] || 'bg-muted text-muted-foreground';
}
