/**
 * Platform configuration for online delivery services.
 *
 * Each platform has:
 * - `id`: Unique identifier used in the database (`platformSales.platformId`)
 * - `label`: Display name shown in the UI
 * - `badgeColor`: Tailwind color used for icons/badges (matches the brand)
 * - `iconLetter`: Single character shown in the colored icon circle
 */

export type Platform = {
  id: string;
  label: string;
  badgeColor: string;
  iconLetter: string;
};

export const PLATFORMS: Platform[] = [
  {
    id: "doordash",
    label: "DoorDash",
    badgeColor: "bg-red-600",
    iconLetter: "D",
  },
  {
    id: "fantuan",
    label: "Fantuan",
    badgeColor: "bg-cyan-600",
    iconLetter: "F",
  },
  {
    id: "ritual",
    label: "Ritual",
    badgeColor: "bg-sky-600",
    iconLetter: "R",
  },
  {
    id: "skip_the_dishes",
    label: "SkipTheDishes",
    badgeColor: "bg-orange-600",
    iconLetter: "S",
  },
  {
    id: "uber_eats",
    label: "UberEats",
    badgeColor: "bg-green-600",
    iconLetter: "U",
  },
  {
    id: "self",
    label: "Store",
    badgeColor: "bg-gray-600",
    iconLetter: "S",
  },
];

/** Default platform IDs for new stores */
export const DEFAULT_PLATFORM_IDS = PLATFORMS.map((p) => p.id);

/** Look up a platform by its ID */
export function getPlatformById(id: string): Platform | undefined {
  return PLATFORMS.find((p) => p.id === id);
}
