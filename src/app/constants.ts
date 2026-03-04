import { CashType } from "@/types";

export const NUM_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const FULL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Abbreviated month names. E.g., Jan, Feb, Mar, etc. */
export const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const MONEY_VALUES = new Map([
  ["bill100", { label: "$100", value: 10000 }],
  ["bill50", { label: "$50", value: 5000 }],
  ["bill20", { label: "$20", value: 2000 }],
  ["bill10", { label: "$10", value: 1000 }],
  ["bill5", { label: "$5", value: 500 }],
  ["coin2", { label: "$2", value: 200 }],
  ["coin1", { label: "$1", value: 100 }],
  ["coin25c", { label: "25¢", value: 25 }],
  ["coin10c", { label: "10¢", value: 10 }],
  ["coin5c", { label: "5¢", value: 5 }],
  ["roll2", { label: "$2", value: 5000 }],
  ["roll1", { label: "$1", value: 2500 }],
  ["roll25c", { label: "25¢", value: 1000 }],
  ["roll10c", { label: "10¢", value: 500 }],
  ["roll5c", { label: "5¢", value: 200 }],
]);

export const MONEY_FIELDS = Array.from(MONEY_VALUES.keys()) as CashType[];
export const COIN_FIELDS = MONEY_FIELDS.filter((key) => key.startsWith("coin"));
export const BILL_FIELDS = MONEY_FIELDS.filter((key) => key.startsWith("bill"));
export const ROLL_FIELDS = MONEY_FIELDS.filter((key) => key.startsWith("roll"));
