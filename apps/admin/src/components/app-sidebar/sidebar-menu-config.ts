import type { IconSvgElement } from "@hugeicons/react";
import { ICONS } from "@serva/ui/constants/icons";

export type MenuItem = {
  title: string;
  url: string;
  icon: IconSvgElement;
};

export const MENU_ITEMS: MenuItem[] = [
  { title: "Companies", url: "/companies", icon: ICONS.BUILDING },
  { title: "Identities", url: "/identities", icon: ICONS.USER_GROUP },
];
