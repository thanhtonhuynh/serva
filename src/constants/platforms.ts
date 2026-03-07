/**
 * Platform configuration for online delivery services.
 *
 * Each platform has:
 * - `id`: Unique identifier used in the database (`platformSales.platformId`)
 * - `label`: Display name shown in the UI
 * - `color`: Tailwind color used for icons/badges (matches the brand)
 * - `iconLetter`: Single character shown in the colored icon circle
 * - `legacyField`: The old hardcoded column name in SaleReport (for backward compat)
 */

export type Platform = {
  id: string;
  label: string;
  color: string;
  iconLetter: string;
  iconSrc: string;
  legacyField: string;
};

export const PLATFORMS: Platform[] = [
  {
    id: "doordash",
    label: "DoorDash",
    color: "red-500",
    iconLetter: "D",
    iconSrc: "/platform-icons/doordash-icon.svg",
    legacyField: "doorDashSales",
  },
  {
    id: "fantuan",
    label: "Fantuan",
    color: "cyan-500",
    iconLetter: "F",
    iconSrc: "/platform-icons/fantuan-icon.svg",
    legacyField: "fantuanSales",
  },
  {
    id: "ritual",
    label: "Ritual",
    color: "sky-300",
    iconLetter: "R",
    iconSrc: "/platform-icons/ritual-icon.svg",
    legacyField: "onlineSales",
  },
  {
    id: "skip_the_dishes",
    label: "SkipTheDishes",
    color: "orange-500",
    iconLetter: "S",
    iconSrc: "/platform-icons/skip-the-dishes-icon.svg",
    legacyField: "skipTheDishesSales",
  },
  {
    id: "uber_eats",
    label: "UberEats",
    color: "green-600",
    iconLetter: "U",
    iconSrc: "/platform-icons/uber-eats-icon.svg",
    legacyField: "uberEatsSales",
  },
];

/** Default platform IDs for new stores */
export const DEFAULT_PLATFORM_IDS = PLATFORMS.map((p) => p.id);

/** Look up a platform by its ID */
export function getPlatformById(id: string): Platform | undefined {
  return PLATFORMS.find((p) => p.id === id);
}

/** Look up a platform by its legacy field name */
export function getPlatformByLegacyField(field: string): Platform | undefined {
  return PLATFORMS.find((p) => p.legacyField === field);
}

/**
 * Map from legacy field name → platform ID.
 * Used during migration and backward-compat reads.
 */
export const LEGACY_FIELD_TO_PLATFORM_ID: Record<string, string> =
  Object.fromEntries(PLATFORMS.map((p) => [p.legacyField, p.id]));

/**
 * Map from platform ID → legacy field name.
 * Used when writing to both new and old columns.
 */
export const PLATFORM_ID_TO_LEGACY_FIELD: Record<string, string> =
  Object.fromEntries(PLATFORMS.map((p) => [p.id, p.legacyField]));
