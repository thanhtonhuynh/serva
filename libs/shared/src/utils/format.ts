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
  return Math.floor(value * 100 + 0.5);
}
