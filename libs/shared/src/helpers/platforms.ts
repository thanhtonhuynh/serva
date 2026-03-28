import { type Platform, PLATFORMS } from "../constants/platforms";

/** Look up a platform by its ID */
export function getPlatformById(id: string): Platform | undefined {
  return PLATFORMS.find((p) => p.id === id);
}
