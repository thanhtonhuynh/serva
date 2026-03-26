import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    // style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Format a number as a currency string with 2 decimal places. Amount is in cents. Convert to dollars. */
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

export function formatNumber(number: number) {
  return new Intl.NumberFormat("en-US").format(number);
}

export function isISOString(value: string) {
  const date = new Date(value);
  return !Number.isNaN(date.valueOf()) && date.toISOString() === value;
}

export function toCents(value: number | null | undefined): number {
  if (!value) return 0;
  // half-up rounding
  return Math.floor(value * 100 + 0.5);
}

// export function parseUrlDate(dateStr?: string): Date | null {
//   if (!dateStr) return null;

//   if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;

//   const d = new Date(`${dateStr}T00:00:00.000Z`);
//   if (isNaN(d.getTime())) return null;

//   return d;
// }
