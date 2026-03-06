import "client-only";

/**
 * Get the local date from a UTC date.
 */
export function getLocalDateFromUTC(date: Date): Date {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/**
 * Get UTC midnight date from a local date.
 */
export function getUTCMidnightFromLocal(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}
